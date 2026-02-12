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

    async findAll(): Promise<Medicine[]> {
        return await this.medicinesRepository.find();
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
