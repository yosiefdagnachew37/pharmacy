import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchesService {
    constructor(
        @InjectRepository(Batch)
        private readonly batchesRepository: Repository<Batch>,
    ) { }

    async create(createBatchDto: CreateBatchDto): Promise<Batch> {
        const { quantity_remaining, initial_quantity } = createBatchDto;

        // Default quantity_remaining to initial_quantity if not provided
        const batchData = {
            ...createBatchDto,
            quantity_remaining: quantity_remaining ?? initial_quantity,
        };

        const batch = this.batchesRepository.create(batchData);
        return await this.batchesRepository.save(batch);
    }

    async findAll(): Promise<Batch[]> {
        return await this.batchesRepository.find({ relations: ['medicine'] });
    }

    async findByMedicine(medicineId: string): Promise<Batch[]> {
        return await this.batchesRepository.find({
            where: { medicine_id: medicineId },
            order: { expiry_date: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Batch> {
        const batch = await this.batchesRepository.findOne({
            where: { id },
            relations: ['medicine'],
        });
        if (!batch) {
            throw new NotFoundException(`Batch with ID ${id} not found`);
        }
        return batch;
    }

    async update(id: string, updateBatchDto: UpdateBatchDto): Promise<Batch> {
        const batch = await this.findOne(id);
        const updated = Object.assign(batch, updateBatchDto);
        return await this.batchesRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const batch = await this.findOne(id);
        await this.batchesRepository.remove(batch);
    }

    async findExpiring(days: number): Promise<Batch[]> {
        const date = new Date();
        date.setDate(date.getDate() + days);

        return await this.batchesRepository.find({
            where: {
                expiry_date: LessThan(date),
                quantity_remaining: MoreThanOrEqual(1),
            },
            relations: ['medicine'],
            order: { expiry_date: 'ASC' },
        });
    }

    async findExpired(): Promise<Batch[]> {
        return await this.batchesRepository.find({
            where: {
                expiry_date: LessThan(new Date()),
            },
            relations: ['medicine'],
        });
    }
}
