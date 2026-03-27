import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, Gender } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { getTenantId, TenantQuery } from '../../common/utils/tenant-query';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientsRepository: Repository<Patient>,
    ) { }

    async create(createPatientDto: CreatePatientDto): Promise<Patient> {
        const patientData = {
            ...createPatientDto,
            gender: createPatientDto.gender as Gender,
            organization_id: getTenantId(),
        };
        const patient = this.patientsRepository.create(patientData);
        return await this.patientsRepository.save(patient);
    }

    async findAll(): Promise<Patient[]> {
        return await this.patientsRepository.find({
            where: { organization_id: getTenantId() }
        });
    }

    async findOne(id: string): Promise<Patient> {
        const patient = await this.patientsRepository.findOne({ 
            where: { id, organization_id: getTenantId() } 
        });
        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }

    async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        const patient = await this.findOne(id);
        const updated = Object.assign(patient, updatePatientDto);
        return await this.patientsRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const patient = await this.findOne(id); // findOne handles tenant check
        await this.patientsRepository.remove(patient);
    }

    async search(query: string): Promise<Patient[]> {
        const qb = this.patientsRepository.createQueryBuilder('patient')
            .where('patient.name ILIKE :query OR patient.phone ILIKE :query', { query: `%${query}%` });
        
        return await TenantQuery.scopeQuery(qb, 'patient').getMany();
    }

    async getHistory(id: string): Promise<Patient> {
        const patient = await this.patientsRepository.findOne({
            where: { id, organization_id: getTenantId() },
            relations: [
                'prescriptions',
                'prescriptions.items',
                'prescriptions.items.medicine',
                'sales',
                'sales.items',
                'sales.items.medicine'
            ],
            order: {
                prescriptions: { created_at: 'DESC' },
                sales: { created_at: 'DESC' }
            }
        });

        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }
}
