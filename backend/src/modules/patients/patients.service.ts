import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient, Gender } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

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
        };
        const patient = this.patientsRepository.create(patientData);
        return await this.patientsRepository.save(patient);
    }

    async findAll(): Promise<Patient[]> {
        return await this.patientsRepository.find();
    }

    async findOne(id: string): Promise<Patient> {
        const patient = await this.patientsRepository.findOne({ where: { id } });
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
        const patient = await this.findOne(id);
        await this.patientsRepository.remove(patient);
    }

    async search(query: string): Promise<Patient[]> {
        return await this.patientsRepository.createQueryBuilder('patient')
            .where('patient.name ILIKE :query OR patient.phone ILIKE :query', { query: `%${query}%` })
            .getMany();
    }
}
