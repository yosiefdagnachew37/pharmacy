import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { AuditSession, AuditSessionStatus } from './entities/audit-session.entity';
import { AuditItem } from './entities/audit-item.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockTransaction, TransactionType, ReferenceType } from './entities/stock-transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StockAuditService {
    constructor(
        @InjectRepository(AuditSession)
        private auditSessionRepo: Repository<AuditSession>,
        @InjectRepository(AuditItem)
        private auditItemRepo: Repository<AuditItem>,
        @InjectRepository(Batch)
        private batchRepo: Repository<Batch>,
        private dataSource: DataSource,
    ) { }

    async createSession(userId: string, notes?: string) {
        return await this.dataSource.transaction(async (manager) => {
            const session = manager.create(AuditSession, {
                created_by: { id: userId } as User,
                status: AuditSessionStatus.IN_PROGRESS,
                notes,
            });
            const savedSession = await manager.save(session);

            // Snapshot all active batches (with stock)
            const activeBatches = await manager.find(Batch, {
                where: { quantity_remaining: MoreThan(0) },
                relations: ['medicine']
            });

            const auditItems = activeBatches.map(batch => manager.create(AuditItem, {
                session_id: savedSession.id,
                medicine_id: batch.medicine_id,
                batch_id: batch.id,
                system_quantity: batch.quantity_remaining,
                scanned_quantity: 0,
                variance: -batch.quantity_remaining, // Initial variance is -stock
            }));

            await manager.save(AuditItem, auditItems);
            return savedSession;
        });
    }

    async updateScannedQuantity(sessionId: string, batchId: string, quantity: number) {
        const item = await this.auditItemRepo.findOne({
            where: { session_id: sessionId, batch_id: batchId }
        });

        if (!item) throw new NotFoundException('Batch not found in this audit session');

        item.scanned_quantity = quantity;
        item.variance = item.scanned_quantity - item.system_quantity;
        return await this.auditItemRepo.save(item);
    }

    async finalizeAudit(sessionId: string) {
        return await this.dataSource.transaction(async (manager) => {
            const session = await manager.findOne(AuditSession, {
                where: { id: sessionId },
                relations: ['items']
            });

            if (!session) throw new NotFoundException('Audit session not found');
            if (session.status !== AuditSessionStatus.IN_PROGRESS) {
                throw new BadRequestException('Audit is not in progress');
            }

            for (const item of session.items) {
                if (item.variance !== 0) {
                    // Update Batch
                    const batch = await manager.findOne(Batch, { where: { id: item.batch_id } });
                    if (batch) {
                        const previousQty = batch.quantity_remaining;
                        batch.quantity_remaining = item.scanned_quantity;
                        await manager.save(batch);

                        // Create Stock Transaction
                        const transaction = manager.create(StockTransaction, {
                            medicine_id: item.medicine_id,
                            batch_id: item.batch_id,
                            type: TransactionType.ADJUSTMENT,
                            quantity: Math.abs(item.variance),
                            reference_type: ReferenceType.ADJUSTMENT,
                            reference_id: sessionId,
                            notes: `Inventory Audit Adjustment (V: ${item.variance}, Session: ${sessionId})`
                        });
                        await manager.save(transaction);
                    }
                }
            }

            session.status = AuditSessionStatus.COMPLETED;
            session.completed_at = new Date();
            return await manager.save(session);
        });
    }

    async getSessions() {
        return await this.auditSessionRepo.find({
            relations: ['created_by'],
            order: { created_at: 'DESC' }
        });
    }

    async getSessionDetails(id: string) {
        return await this.auditSessionRepo.findOne({
            where: { id },
            relations: ['items', 'items.medicine', 'items.batch', 'created_by']
        });
    }
}

// Add MoreThan to imports
import { MoreThan } from 'typeorm';
