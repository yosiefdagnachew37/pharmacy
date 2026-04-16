import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine, ProductType } from './entities/medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { scopeQuery, getTenantId } from '../../common/utils/tenant-query';
import { Batch } from '../batches/entities/batch.entity';

@Injectable()
export class MedicinesService {
    constructor(
        @InjectRepository(Medicine)
        private readonly medicinesRepository: Repository<Medicine>,
        @InjectRepository(Batch)
        private readonly batchesRepository: Repository<Batch>,
    ) { }

    async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
        const { batch_number, initial_quantity, selling_price, purchase_price, expiry_date, ...medicineData } = createMedicineDto;

        const medicine = this.medicinesRepository.create({
            ...medicineData,
            is_expirable: medicineData.is_expirable !== undefined ? medicineData.is_expirable : true,
            product_type: medicineData.product_type as ProductType,
            organization_id: getTenantId(),
        });

        let savedMedicine: Medicine;
        try {
            savedMedicine = await this.medicinesRepository.save(medicine);
        } catch (err: any) {
            if (err.code === '23505' || err.message?.includes('unique constraint')) {
                const detail: string = err.detail || err.message || '';
                if (detail.includes('sku')) {
                    throw new BadRequestException(`Item ID '${createMedicineDto.sku}' is already used by another medicine. Please use a unique Item ID.`);
                }
                if (detail.includes('barcode')) {
                    throw new BadRequestException(`Barcode '${createMedicineDto.sku}' is already registered.`);
                }
                // Default: name conflict
                throw new BadRequestException(`A medicine named '${createMedicineDto.name}' already exists for this organization.`);
            }
            throw err;
        }

        // Auto-create first batch if batch info provided
        if (batch_number && initial_quantity !== undefined && initial_quantity > 0) {
            const batchData: any = {
                medicine_id: savedMedicine.id,
                batch_number,
                initial_quantity,
                quantity_remaining: initial_quantity,
                selling_price: selling_price ?? 0,
                purchase_price: purchase_price ?? 0,
                organization_id: getTenantId(),
            };
            if (expiry_date) {
                batchData.expiry_date = new Date(expiry_date);
            }
            const batch = this.batchesRepository.create(batchData);
            await this.batchesRepository.save(batch);
        }

        return savedMedicine;
    }

    async findAll(product_type?: ProductType) {
        try {
            let qb = this.medicinesRepository.createQueryBuilder('m')
                .leftJoin('m.batches', 'b', 'b.deleted_at IS NULL AND (b.expiry_date IS NULL OR b.expiry_date >= :now)', { now: new Date().toISOString().split('T')[0] });
            
            qb = scopeQuery(qb, 'm');

            if (product_type) {
                qb = qb.andWhere('m.product_type = :product_type', { product_type });
            }

            const results = await qb
                .select([
                    'm.id',
                    'm.name',
                    'm.generic_name',
                    'm.category',
                    'm.unit',
                    'm.sku',
                    'm.dosage_form',
                    'm.is_expirable',
                    'm.minimum_stock_level',
                    'm.is_controlled',
                    'm.product_type',
                    'm.preferred_supplier_id',
                ])
                .addSelect('SUM(COALESCE(b.quantity_remaining, 0))', 'total_stock')
                .addSelect('MAX(b.selling_price)', 'selling_price')
                .addSelect('MAX(b.purchase_price)', 'purchase_price')
                .addSelect('MIN(b.expiry_date)', 'expiry_date')
                .addSelect('MAX(b.batch_number)', 'batch_number')
                .andWhere('m.deleted_at IS NULL')
                .groupBy('m.id')
                .addGroupBy('m.name')
                .addGroupBy('m.generic_name')
                .addGroupBy('m.category')
                .addGroupBy('m.unit')
                .addGroupBy('m.sku')
                .addGroupBy('m.dosage_form')
                .addGroupBy('m.is_expirable')
                .addGroupBy('m.minimum_stock_level')
                .addGroupBy('m.is_controlled')
                .addGroupBy('m.product_type')
                .addGroupBy('m.preferred_supplier_id')
                .getRawMany();

            return results.map(res => ({
                id: res.m_id,
                name: res.m_name,
                generic_name: res.m_generic_name,
                category: res.m_category,
                unit: res.m_unit,
                sku: res.m_sku,
                dosage_form: res.m_dosage_form,
                is_expirable: String(res.m_is_expirable) === 'true',
                minimum_stock_level: res.m_minimum_stock_level,
                is_controlled: String(res.m_is_controlled) === 'true',
                product_type: res.m_product_type || ProductType.MEDICINE,
                preferred_supplier_id: res.m_preferred_supplier_id,
                total_stock: Number(res.total_stock || 0),
                selling_price: Number(res.selling_price || 0)
            }));
        } catch (error) {
            console.error('Error in MedicinesService.findAll:', error);
            throw error;
        }
    }

    async findOne(id: string): Promise<Medicine> {
        const medicine = await this.medicinesRepository.findOne({ 
            where: { id, organization_id: getTenantId() } 
        });
        if (!medicine) {
            throw new NotFoundException(`Medicine with ID ${id} not found`);
        }
        return medicine;
    }

    async update(id: string, updateMedicineDto: UpdateMedicineDto): Promise<Medicine> {
        const medicine = await this.findOne(id);
        const updated = Object.assign(medicine, updateMedicineDto);
        try {
            return await this.medicinesRepository.save(updated);
        } catch (err: any) {
            if (err.message?.includes('unique constraint') || err.code === '23505') {
                throw new BadRequestException(`Medicine with name '${updateMedicineDto.name || medicine.name}' already exists.`);
            }
            throw err;
        }
    }

    async remove(id: string): Promise<void> {
        // Use a hard delete to prevent unique constraint conflicts (allowing re-registration of the same SKU/Name)
        const deleteResult = await this.medicinesRepository.delete({ id, organization_id: getTenantId() });
        if (deleteResult.affected === 0) {
            throw new NotFoundException(`Medicine with ID ${id} not found`);
        }
    }

    async importFromExcel(buffer: Buffer, productType: ProductType = ProductType.MEDICINE): Promise<{ created: number; errors: { row: number; message: string }[] }> {
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            return { created: 0, errors: [{ row: 0, message: 'No worksheet found in file' }] };
        }

        const created: any[] = [];
        const errors: { row: number; message: string }[] = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // skip header

            const isCosmetic = productType === ProductType.COSMETIC;
            
            const sku = row.getCell(1).value?.toString()?.trim() || '';
            const name = row.getCell(2).value?.toString()?.trim();

            let category = '';
            let unit = isCosmetic ? 'PCS' : 'TAB';
            let minimum_stock_level: number;
            let generic_name = '';
            let dosage_form = '';
            let is_expirable = true;
            
            // Batch related fields (optional)
            let batch_number = '';
            let initial_quantity: number | undefined;
            let purchase_price: number | undefined;
            let selling_price: number | undefined;
            let expiry_date: string | undefined;

            if (isCosmetic) {
                // Cosmetics Order: SKU, Name, Category, Unit, Min Stock, Batch, Qty, Purchase, Selling, Expiry
                category = row.getCell(3).value?.toString()?.trim() || '';
                unit = row.getCell(4).value?.toString()?.trim() || 'PCS';
                minimum_stock_level = parseInt(row.getCell(5).value?.toString() || '5') || 5;
                batch_number = row.getCell(6).value?.toString()?.trim() || '';
                initial_quantity = parseInt(row.getCell(7).value?.toString() || '') || undefined;
                purchase_price = parseFloat(row.getCell(8).value?.toString() || '') || undefined;
                selling_price = parseFloat(row.getCell(9).value?.toString() || '') || undefined;
                
                const expVal = row.getCell(10).value;
                if (expVal instanceof Date) {
                    expiry_date = expVal.toISOString().split('T')[0];
                } else if (typeof expVal === 'string' && expVal.includes('-')) {
                    // Handle MM-DD-YYYY
                    const parts = expVal.split('-');
                    if (parts.length === 3) {
                        expiry_date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                    }
                } else if (typeof expVal === 'string' && expVal.includes('/')) {
                    // Handle MM/DD/YYYY
                    const parts = expVal.split('/');
                    if (parts.length === 3) {
                        expiry_date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                    }
                } else {
                    expiry_date = expVal?.toString()?.trim();
                }
            } else {
                // Medicines Order: SKU, Name, Generic, Dosage, Batch, Expirable, Expiry, Unit, Qty, Min Stock, Selling
                generic_name = row.getCell(3).value?.toString()?.trim() || '';
                dosage_form = row.getCell(4).value?.toString()?.trim() || '';
                batch_number = row.getCell(5).value?.toString()?.trim() || '';
                is_expirable = !['false', 'no', '0'].includes((row.getCell(6).value?.toString()?.trim() || '').toLowerCase());
                
                const expVal = row.getCell(7).value;
                if (expVal instanceof Date) {
                    expiry_date = expVal.toISOString().split('T')[0];
                } else if (typeof expVal === 'string' && expVal.includes('-')) {
                    // Handle MM-DD-YYYY
                    const parts = expVal.split('-');
                    if (parts.length === 3) {
                        expiry_date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                    }
                } else if (typeof expVal === 'string' && expVal.includes('/')) {
                    // Handle MM/DD/YYYY
                    const parts = expVal.split('/');
                    if (parts.length === 3) {
                        expiry_date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                    }
                } else {
                    expiry_date = expVal?.toString()?.trim();
                }
                
                unit = row.getCell(8).value?.toString()?.trim() || 'TAB';
                initial_quantity = parseInt(row.getCell(9).value?.toString() || '') || undefined;
                minimum_stock_level = parseInt(row.getCell(10).value?.toString() || '10') || 10;
                selling_price = parseFloat(row.getCell(11).value?.toString() || '') || undefined;
            }

            if (!name) {
                errors.push({ row: rowNumber, message: 'Product name is required' });
                return;
            }

            created.push({ 
                name, generic_name, dosage_form, unit, minimum_stock_level, is_expirable, sku, category,
                product_type: productType,
                batch_number, initial_quantity, purchase_price, selling_price, expiry_date,
                organization_id: getTenantId()
            });
        });

        let savedCount = 0;
        for (let i = 0; i < created.length; i++) {
            try {
                // Use the main create method which handles batch creation, pricing, etc.
                await this.create(created[i] as any);
                savedCount++;
            } catch (err: any) {
                let message = err.message || 'Failed to save';
                if (err.message?.includes('already used') || err.message?.includes('already exists')) {
                    message = `SKU or Name already exists for row ${i + 2}`;
                }
                errors.push({ row: i + 2, message });
            }
        }

        return { created: savedCount, errors };
    }
}
