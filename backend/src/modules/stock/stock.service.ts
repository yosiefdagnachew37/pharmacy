import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan, MoreThanOrEqual } from 'typeorm';
import { StockTransaction, TransactionType, ReferenceType } from './entities/stock-transaction.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { getTenantId, TenantQuery } from '../../common/utils/tenant-query';

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
        const organization_id = getTenantId();
        return await this.dataSource.transaction(async (manager) => {
            const batch = await manager.findOne(Batch, { 
                where: { id: batchId, organization_id } 
            });
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
                organization_id,
            });

            return await manager.save(transaction);
        });
    }

    /**
     * FEFO (First Expiry, First Out) Stock Issuance Logic
     * - Sorts available batches by earliest expiry date
     * - Skips locked, quarantined, and expired batches
     * - Rejects batches expiring within the next 24 hours (configurable)
     */
    async issueStock(
        medicineId: string,
        requestedQuantity: number,
        reference_type: ReferenceType,
        reference_id: string,
        userId: string,
    ) {
        const organization_id = getTenantId();
        return await this.dataSource.transaction(async (manager) => {
            const tomorrow = new Date();
            tomorrow.setHours(tomorrow.getHours() + 24);

            // FEFO query: find non-locked, non-quarantined batches sorted by earliest expiry
            // Using pessimistic_write (FOR UPDATE) for transactional safety
            const availableBatches = await manager
                .createQueryBuilder(Batch, 'b')
                .setLock('pessimistic_write')
                .where('b.medicine_id = :medicineId', { medicineId })
                .andWhere('b.organization_id = :organization_id', { organization_id })
                .andWhere('b.quantity_remaining > 0')
                .andWhere('b.is_locked = :locked', { locked: false })
                .andWhere('b.is_quarantined = :quarantined', { quarantined: false })
                .andWhere('b.expiry_date > :tomorrow', { tomorrow })
                .orderBy('b.expiry_date', 'ASC')
                .addOrderBy('b.created_at', 'ASC')
                .getMany();

            const totalAvailable = availableBatches.reduce((sum, b) => sum + b.quantity_remaining, 0);
            if (totalAvailable < requestedQuantity) {
                console.warn(`FEFO rejection: Insufficient non-expired stock for medicine ${medicineId}`);
                throw new BadRequestException('Insufficient non-expired stock available');
            }

            let remainingToIssue = requestedQuantity;
            const results: StockTransaction[] = [];

            for (const batch of availableBatches) {
                if (remainingToIssue <= 0) break;

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
                    is_fefo_override: false,
                    organization_id,
                });

                const savedTransaction = await manager.save(transaction);
                results.push(savedTransaction);

                remainingToIssue -= issueFromThisBatch;
            }

            if (remainingToIssue > 0) {
                throw new BadRequestException('Insufficient non-expired stock available');
            }

            return results;
        });
    }

    /**
     * FEFO Override: Issue from a specific batch (Admin/Pharmacist only)
     * - Blocked for controlled substances
     * - Requires a reason
     * - Logged as FEFO_OVERRIDE
     */
    async issueStockWithOverride(
        batchId: string,
        quantity: number,
        reference_type: ReferenceType,
        reference_id: string,
        userId: string,
        overrideReason: string,
    ) {
        const organization_id = getTenantId();
        return await this.dataSource.transaction(async (manager) => {
            const batch = await manager.findOne(Batch, {
                where: { id: batchId, organization_id },
                relations: ['medicine'],
            });
            if (!batch) throw new NotFoundException('Batch not found');

            // Block override for controlled substances
            if (batch.medicine?.is_controlled) {
                throw new ForbiddenException(
                    'FEFO override is not allowed for controlled substances. Strict FEFO is enforced.',
                );
            }

            if (batch.is_locked) {
                throw new BadRequestException('This batch is locked (expired) and cannot be sold.');
            }

            if (batch.quantity_remaining < quantity) {
                throw new BadRequestException(`Insufficient stock in batch ${batch.batch_number}`);
            }

            if (!overrideReason || overrideReason.trim().length === 0) {
                throw new BadRequestException('A reason is required for FEFO override.');
            }

            batch.quantity_remaining -= quantity;
            await manager.save(batch);

            const transaction = manager.create(StockTransaction, {
                batch_id: batchId,
                type: TransactionType.OUT,
                quantity,
                reference_type,
                reference_id,
                created_by: userId,
                is_fefo_override: true,
                override_reason: overrideReason.trim(),
                organization_id,
            });

            return await manager.save(transaction);
        });
    }

    async getTransactionHistory(batchId?: string) {
        const qb = this.transactionRepository.createQueryBuilder('t')
            .leftJoinAndSelect('t.batch', 'batch')
            .leftJoinAndSelect('batch.medicine', 'medicine')
            .orderBy('t.created_at', 'DESC');

        if (batchId) {
            qb.andWhere('t.batch_id = :batchId', { batchId });
        }

        return await TenantQuery.scopeQuery(qb, 't').getMany();
    }

    async getMedicineStock(medicineId: string) {
        const orgId = getTenantId();
        const res = await this.batchesRepository.createQueryBuilder('b')
            .select('SUM(b.quantity_remaining)', 'total')
            .where('b.medicine_id = :medicineId', { medicineId })
            .andWhere('b.organization_id = :orgId', { orgId })
            .andWhere('b.is_locked = :locked', { locked: false })
            .andWhere('b.is_quarantined = :quarantined', { quarantined: false })
            .andWhere('b.expiry_date >= :now', { now: new Date() })
            .getRawOne();

        return parseInt(res.total, 10) || 0;
    }
}

