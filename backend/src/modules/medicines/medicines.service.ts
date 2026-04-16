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
        const medicine = await this.findOne(id);
        await this.medicinesRepository.softRemove(medicine);
    }

    async importFromExcel(buffer: Buffer): Promise<{ created: number; errors: { row: number; message: string }[] }> {
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

            const name = row.getCell(1).value?.toString()?.trim();
            const generic_name = row.getCell(2).value?.toString()?.trim() || '';
            const dosage_form = row.getCell(3).value?.toString()?.trim() || '';
            const unit = row.getCell(4).value?.toString()?.trim() || 'TAB';
            const minimum_stock_level = parseInt(row.getCell(5).value?.toString() || '10') || 10;
            const is_expirable = !['false', 'no', '0'].includes((row.getCell(6).value?.toString()?.trim() || '').toLowerCase());
            const sku = row.getCell(7).value?.toString()?.trim() || '';

            if (!name) {
                errors.push({ row: rowNumber, message: 'Medicine name is required' });
                return;
            }

            created.push({ 
                name, generic_name, dosage_form, unit, minimum_stock_level, is_expirable, sku,
                organization_id: getTenantId()
            });
        });

        let savedCount = 0;
        for (let i = 0; i < created.length; i++) {
            try {
                const medicine = this.medicinesRepository.create(created[i]);
                await this.medicinesRepository.save(medicine);
                savedCount++;
            } catch (err: any) {
                let message = err.message || 'Failed to save';
                if (err.message?.includes('unique constraint') || err.code === '23505') {
                    message = `Medicine "${created[i].name}" already exists.`;
                }
                errors.push({ row: i + 2, message });
            }
        }

        return { created: savedCount, errors };
    }
}
