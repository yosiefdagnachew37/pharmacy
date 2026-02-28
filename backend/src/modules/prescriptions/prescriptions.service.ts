import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

@Injectable()
export class PrescriptionsService {
    constructor(
        @InjectRepository(Prescription)
        private readonly prescriptionsRepository: Repository<Prescription>,
        @InjectRepository(PrescriptionItem)
        private readonly itemsRepository: Repository<PrescriptionItem>,
        private dataSource: DataSource,
    ) { }

    async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
        const { items, ...prescriptionData } = createPrescriptionDto;

        return await this.dataSource.transaction(async (manager) => {
            // Create Prescription
            const prescription = manager.create(Prescription, prescriptionData);
            const savedPrescription = await manager.save(prescription);

            // Create Items
            if (items && items.length > 0) {
                const itemEntities = items.map(item =>
                    manager.create(PrescriptionItem, {
                        ...item,
                        prescription_id: savedPrescription.id,
                    })
                );
                await manager.save(itemEntities);
            }

            const finalPrescription = await manager.findOne(Prescription, {
                where: { id: savedPrescription.id },
                relations: ['items', 'items.medicine', 'patient'],
            });

            if (!finalPrescription) throw new Error('Prescription creation failed');
            return finalPrescription;
        });
    }

    async findAll(): Promise<Prescription[]> {
        return await this.prescriptionsRepository.find({
            relations: ['items', 'items.medicine', 'patient'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Prescription> {
        const prescription = await this.prescriptionsRepository.findOne({
            where: { id },
            relations: ['items', 'items.medicine', 'patient'],
        });
        if (!prescription) {
            throw new NotFoundException(`Prescription with ID ${id} not found`);
        }
        return prescription;
    }

    async findByPatient(patientId: string): Promise<Prescription[]> {
        return await this.prescriptionsRepository.find({
            where: { patient_id: patientId },
            relations: ['items', 'items.medicine'],
            order: { created_at: 'DESC' },
        });
    }

    async remove(id: string): Promise<void> {
        const prescription = await this.findOne(id);
        await this.prescriptionsRepository.remove(prescription);
    }
}
