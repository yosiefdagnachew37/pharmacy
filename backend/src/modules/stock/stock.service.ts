import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan } from 'typeorm';
import { StockTransaction, TransactionType, ReferenceType } from './entities/stock-transaction.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(StockTransaction)
        private readonly transactionRepository: Repository<StockTransaction>,
        @InjectRepository(Batch)
        private readonly batchesRepository: Repository<Batch>,
        private dataSource: DataSource,
    ) { }

    /**
     * Records a single stock transaction and updates the batch quantity.
     */
    async recordTransaction(
        batchId: string,
        type: TransactionType,
        quantity: number,
        reference_type: ReferenceType,
        reference_id: string,
        userId: string,
    ) {
        return await this.dataSource.transaction(async (manager) => {
            const batch = await manager.findOne(Batch, { where: { id: batchId } });
            if (!batch) throw new NotFoundException('Batch not found');

            if (type === TransactionType.OUT && batch.quantity_remaining < quantity) {
                console.warn(`Stock rejection: Insufficient stock in batch ${batch.batch_number}`);
                throw new BadRequestException(`Insufficient stock in batch ${batch.batch_number}`);
            }

            // Update batch quantity
            if (type === TransactionType.IN) {
                batch.quantity_remaining += quantity;
            } else if (type === TransactionType.OUT) {
                batch.quantity_remaining -= quantity;
            }

            await manager.save(batch);

            // Create transaction log
            const transaction = manager.create(StockTransaction, {
                batch_id: batchId,
                type,
                quantity,
                reference_type,
                reference_id,
                created_by: userId,
            });

            return await manager.save(transaction);
        });
    }

    /**
     * FIFO Stock Issuance Logic
     */
    async issueStock(
        medicineId: string,
        requestedQuantity: number,
        reference_type: ReferenceType,
        reference_id: string,
        userId: string,
    ) {
        return await this.dataSource.transaction(async (manager) => {
            // Find batches with stock, sorted by earliest expiry (FIFO)
            const availableBatches = await manager.find(Batch, {
                where: {
                    medicine_id: medicineId,
                    quantity_remaining: MoreThan(0),
                },
                order: { expiry_date: 'ASC' },
            });

            const totalAvailable = availableBatches.reduce((sum, b) => sum + b.quantity_remaining, 0);
            if (totalAvailable < requestedQuantity) {
                console.warn(`Stock rejection: Insufficient total stock for medicine ${medicineId}`);
                throw new BadRequestException('Insufficient total stock for this medicine');
            }

            let remainingToIssue = requestedQuantity;
            const results: StockTransaction[] = [];

            for (const batch of availableBatches) {
                if (remainingToIssue <= 0) break;

                // Check if batch is expired
                if (new Date(batch.expiry_date) < new Date()) {
                    continue; // Skip expired batches
                }

                const issueFromThisBatch = Math.min(batch.quantity_remaining, remainingToIssue);

                // Update batch quantity
                batch.quantity_remaining -= issueFromThisBatch;
                await manager.save(batch);

                const transaction = manager.create(StockTransaction, {
                    batch_id: batch.id,
                    type: TransactionType.OUT,
                    quantity: issueFromThisBatch,
                    reference_type,
                    reference_id,
                    created_by: userId,
                });

                const savedTransaction = await manager.save(transaction);
                results.push(savedTransaction);

                remainingToIssue -= issueFromThisBatch;
            }

            if (remainingToIssue > 0) {
                console.warn(`Stock rejection: Insufficient non-expired stock for medicine ${medicineId}`);
                throw new BadRequestException('Insufficient non-expired stock available');
            }

            return results;
        });
    }

    async getTransactionHistory(batchId?: string) {
        const query = this.transactionRepository.createQueryBuilder('t')
            .leftJoinAndSelect('t.batch', 'batch')
            .leftJoinAndSelect('batch.medicine', 'medicine')
            .orderBy('t.created_at', 'DESC');

        if (batchId) {
            query.where('t.batch_id = :batchId', { batchId });
        }

        return await query.getMany();
    }

    async getMedicineStock(medicineId: string) {
        const res = await this.batchesRepository.createQueryBuilder('b')
            .select('SUM(b.quantity_remaining)', 'total')
            .where('b.medicine_id = :medicineId', { medicineId })
            .andWhere('b.expiry_date >= :now', { now: new Date() })
            .getRawOne();

        return parseInt(res.total, 10) || 0;
    }
}
