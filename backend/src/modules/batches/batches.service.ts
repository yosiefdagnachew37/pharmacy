import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { getTenantId } from '../../common/utils/tenant-query';

@Injectable()
export class BatchesService {
    constructor(
        @InjectRepository(Batch)
        private readonly batchesRepository: Repository<Batch>,
        @InjectRepository(Medicine)
        private readonly medicinesRepository: Repository<Medicine>,
    ) { }

    async create(createBatchDto: CreateBatchDto): Promise<Batch> {
        const { quantity_remaining, initial_quantity } = createBatchDto;

        // Default quantity_remaining to initial_quantity if not provided
        const batchData: any = {
            ...createBatchDto,
            quantity_remaining: quantity_remaining ?? initial_quantity,
            expiry_date: (createBatchDto.expiry_date && createBatchDto.expiry_date !== "") 
                ? new Date(createBatchDto.expiry_date) 
                : null,
        };

        const batch = this.batchesRepository.create({
            ...batchData,
            organization_id: getTenantId(),
        });
        return await this.batchesRepository.save(batch as any);
    }

    async findAll(): Promise<Batch[]> {
        return await this.batchesRepository.find({ 
            where: { organization_id: getTenantId() },
            relations: ['medicine'] 
        });
    }

    async findByMedicine(medicineId: string): Promise<Batch[]> {
        return await this.batchesRepository
            .createQueryBuilder('b')
            .where('b.medicine_id = :medicineId', { medicineId })
            .andWhere('b.organization_id = :orgId', { orgId: getTenantId() })
            .orderBy('CASE WHEN b.expiry_date IS NULL THEN 1 ELSE 0 END', 'ASC')
            .addOrderBy('b.expiry_date', 'ASC')
            .getMany();
    }

    async findOne(id: string): Promise<Batch> {
        const batch = await this.batchesRepository.findOne({
            where: { id, organization_id: getTenantId() },
            relations: ['medicine'],
        });
        if (!batch) {
            throw new NotFoundException(`Batch with ID ${id} not found`);
        }
        return batch;
    }

    async update(id: string, updateBatchDto: UpdateBatchDto): Promise<Batch> {
        const batch = await this.findOne(id);
        
        // Convert empty string expiry_date to null, or string to Date object
        if (updateBatchDto.expiry_date === "" || !updateBatchDto.expiry_date) {
            updateBatchDto.expiry_date = null as any;
        } else if (typeof updateBatchDto.expiry_date === 'string') {
            updateBatchDto.expiry_date = new Date(updateBatchDto.expiry_date) as any;
        }

        const updated = Object.assign(batch, updateBatchDto);
        return await this.batchesRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const batch = await this.findOne(id);
        await this.batchesRepository.softRemove(batch);
    }

    async findExpiring(days: number): Promise<Batch[]> {
        const date = new Date();
        date.setDate(date.getDate() + days);

        return await this.batchesRepository
            .createQueryBuilder('b')
            .leftJoinAndSelect('b.medicine', 'm')
            .where('b.expiry_date IS NOT NULL')
            .andWhere('b.expiry_date < :date', { date })
            .andWhere('b.quantity_remaining >= 1')
            .andWhere('b.organization_id = :orgId', { orgId: getTenantId() })
            .andWhere('m.is_expirable = true')
            .orderBy('b.expiry_date', 'ASC')
            .getMany();
    }

    async findExpired(): Promise<Batch[]> {
        return await this.batchesRepository
            .createQueryBuilder('b')
            .leftJoinAndSelect('b.medicine', 'm')
            .where('b.expiry_date IS NOT NULL')
            .andWhere('b.expiry_date < :now', { now: new Date() })
            .andWhere('b.organization_id = :orgId', { orgId: getTenantId() })
            .andWhere('m.is_expirable = true')
            .getMany();
    }

    async importFromExcel(buffer: Buffer): Promise<{ created: number; errors: { row: number; message: string }[] }> {
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            return { created: 0, errors: [{ row: 0, message: 'No worksheet found in file' }] };
        }

        // Pre-fetch all medicines for name lookup (scoped to tenant)
        const allMedicines = await this.medicinesRepository.find({
            where: { organization_id: getTenantId() }
        });
        const medicineMap = new Map(allMedicines.map(m => [m.name.toLowerCase(), m.id]));

        const toCreate: any[] = [];
        const errors: { row: number; message: string }[] = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // skip header

            const medicine_name = row.getCell(1).value?.toString()?.trim();
            const batch_number = row.getCell(2).value?.toString()?.trim();
            const expiry_date = row.getCell(3).value?.toString()?.trim();
            const purchase_price = parseFloat(row.getCell(4).value?.toString() || '0') || 0;
            const selling_price = parseFloat(row.getCell(5).value?.toString() || '0') || 0;
            const initial_quantity = parseInt(row.getCell(6).value?.toString() || '0') || 0;

            if (!medicine_name) {
                errors.push({ row: rowNumber, message: 'Medicine name is required' });
                return;
            }
            if (!batch_number) {
                errors.push({ row: rowNumber, message: 'Batch number is required' });
                return;
            }

            const medicine_id = medicineMap.get(medicine_name.toLowerCase());
            if (!medicine_id) {
                errors.push({ row: rowNumber, message: `Medicine "${medicine_name}" not found` });
                return;
            }

            toCreate.push({
                medicine_id,
                batch_number,
                expiry_date: new Date(expiry_date || new Date()),
                purchase_price,
                selling_price,
                initial_quantity,
                quantity_remaining: initial_quantity,
                organization_id: getTenantId(),
            });
        });

        let savedCount = 0;
        for (let i = 0; i < toCreate.length; i++) {
            try {
                const batch = this.batchesRepository.create(toCreate[i]);
                await this.batchesRepository.save(batch);
                savedCount++;
            } catch (err: any) {
                let message = err.message || 'Failed to save';
                errors.push({ row: i + 2, message });
            }
        }

        return { created: savedCount, errors };
    }
}
