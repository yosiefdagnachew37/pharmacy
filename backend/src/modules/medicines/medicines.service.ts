import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medicine } from './entities/medicine.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
    constructor(
        @InjectRepository(Medicine)
        private readonly medicinesRepository: Repository<Medicine>,
    ) { }

    async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
        const medicine = this.medicinesRepository.create(createMedicineDto);
        try {
            return await this.medicinesRepository.save(medicine);
        } catch (err: any) {
            if (err.message?.includes('unique constraint') || err.code === '23505') {
                throw new BadRequestException(`Medicine with name '${createMedicineDto.name}' already exists.`);
            }
            throw err;
        }
    }

    async findAll() {
        try {
            const results = await this.medicinesRepository.createQueryBuilder('m')
                .leftJoin('m.batches', 'b', 'b.expiry_date >= :now AND b.deleted_at IS NULL', { now: new Date().toISOString().split('T')[0] })
                .select([
                    'm.id',
                    'm.name',
                    'm.generic_name',
                    'm.category',
                    'm.unit',
                    'm.minimum_stock_level',
                    'm.current_selling_price',
                    'm.is_controlled'
                ])
                .addSelect('SUM(COALESCE(b.quantity_remaining, 0))', 'total_stock')
                .addSelect('MAX(b.selling_price)', 'selling_price')
                .where('m.deleted_at IS NULL')
                .groupBy('m.id')
                .addGroupBy('m.name')
                .addGroupBy('m.generic_name')
                .addGroupBy('m.category')
                .addGroupBy('m.unit')
                .addGroupBy('m.minimum_stock_level')
                .addGroupBy('m.current_selling_price')
                .addGroupBy('m.is_controlled')
                .getRawMany();

            return results.map(res => ({
                id: res.m_id,
                name: res.m_name,
                generic_name: res.m_generic_name,
                category: res.m_category,
                unit: res.m_unit,
                minimum_stock_level: res.m_minimum_stock_level,
                current_selling_price: Number(res.m_current_selling_price || 0),
                is_controlled: String(res.m_is_controlled) === 'true',
                total_stock: Number(res.total_stock || 0),
                selling_price: Number(res.selling_price || 0)
            }));
        } catch (error) {
            console.error('Error in MedicinesService.findAll:', error);
            throw error;
        }
    }

    async findOne(id: string): Promise<Medicine> {
        const medicine = await this.medicinesRepository.findOne({ where: { id } });
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
            const category = row.getCell(3).value?.toString()?.trim() || '';
            const unit = row.getCell(4).value?.toString()?.trim() || 'TAB';
            const minimum_stock_level = parseInt(row.getCell(5).value?.toString() || '10') || 10;
            const is_controlled = ['true', 'yes', '1'].includes((row.getCell(6).value?.toString()?.trim() || '').toLowerCase());

            if (!name) {
                errors.push({ row: rowNumber, message: 'Medicine name is required' });
                return;
            }

            created.push({ name, generic_name, category, unit, minimum_stock_level, is_controlled });
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
