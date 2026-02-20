import { Injectable, NotFoundException } from '@nestjs/common';
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
        return await this.medicinesRepository.save(medicine);
    }

    async findAll() {
        try {
            const results = await this.medicinesRepository.createQueryBuilder('m')
                .leftJoin('m.batches', 'b')
                .select([
                    'm.id',
                    'm.name',
                    'm.generic_name',
                    'm.category',
                    'm.unit',
                    'm.minimum_stock_level',
                    'm.is_controlled'
                ])
                .addSelect('SUM(COALESCE(b.quantity_remaining, 0))', 'total_stock')
                .addSelect('MAX(b.selling_price)', 'selling_price')
                .groupBy('m.id')
                .addGroupBy('m.name')
                .addGroupBy('m.generic_name')
                .addGroupBy('m.category')
                .addGroupBy('m.unit')
                .addGroupBy('m.minimum_stock_level')
                .addGroupBy('m.is_controlled')
                .getRawMany();

            return results.map(res => ({
                id: res.m_id,
                name: res.m_name,
                generic_name: res.m_generic_name,
                category: res.m_category,
                unit: res.m_unit,
                minimum_stock_level: res.m_minimum_stock_level,
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
        return await this.medicinesRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const medicine = await this.findOne(id);
        await this.medicinesRepository.remove(medicine);
    }
}
