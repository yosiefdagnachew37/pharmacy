import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryFailedError } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PurchaseOrder, POStatus, POPaymentMethod, POPaymentStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { Batch } from '../batches/entities/batch.entity';
import { StockTransaction, TransactionType, ReferenceType } from '../stock/entities/stock-transaction.entity';
import { ForecastingService } from '../forecasting/forecasting.service';
import { Medicine } from '../medicines/entities/medicine.entity';
import { ExpiryIntelligenceService } from '../stock/expiry-intelligence.service';
import { getTenantId } from '../../common/utils/tenant-query';
import { tenantStorage } from '../../common/context/tenant.context';
import { OrganizationsService } from '../organizations/organizations.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { PaymentAccount } from '../payment-accounts/entities/payment-account.entity';
import { PaymentAccountTransaction, TransactionType as PATransactionType, ReferenceType as PAReferenceType } from '../payment-accounts/entities/payment-account-transaction.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PurchaseOrdersService {
    constructor(
        @InjectRepository(PurchaseOrder)
        private readonly poRepo: Repository<PurchaseOrder>,
        @InjectRepository(PurchaseOrderItem)
        private readonly poItemRepo: Repository<PurchaseOrderItem>,
        @InjectRepository(GoodsReceipt)
        private readonly grRepo: Repository<GoodsReceipt>,
        @InjectRepository(Medicine)
        private readonly medicineRepo: Repository<Medicine>,
        private readonly organizationsService: OrganizationsService,
        private readonly suppliersService: SuppliersService,
        private forecastingService: ForecastingService,
        private expiryIntelligenceService: ExpiryIntelligenceService,
        private dataSource: DataSource,
        private readonly notificationsService: NotificationsService,
    ) { }

    // ─── PO CRUD ──────────────────────────────────────
    async findAll(status?: POStatus) {
        const query: any = { organization_id: getTenantId() };
        if (status) query.status = status;

        return this.poRepo.find({
            where: query,
            relations: ['supplier'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string) {
        const po = await this.poRepo.findOne({
            where: { id, organization_id: getTenantId() },
            relations: ['supplier'],
        });
        if (!po) throw new NotFoundException('Purchase order not found');
        return po;
    }

    async getItems(poId: string) {
        return this.poItemRepo.find({
            where: { purchase_order_id: poId, organization_id: getTenantId() },
            relations: ['medicine'],
        });
    }

    async create(data: {
        supplier_id: string;
        items: Array<{ medicine_id: string; quantity_ordered: number; unit_price: number }>;
        notes?: string;
        expected_delivery?: string;
        payment_method?: POPaymentMethod;
        is_vat_inclusive?: boolean;
        vat_rate?: number;
        cheque_bank_name?: string;
        cheque_number?: string;
        cheque_issue_date?: string;
        cheque_due_date?: string;
        cheque_amount?: number;
    }, userId: string) {
        const organization_id = getTenantId();
        return await this.dataSource.transaction(async (manager) => {
            // Generate PO number (scoped to org)
            const count = await manager.count(PurchaseOrder, { where: { organization_id } });
            const poNumber = `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;

            // Calculate total + optional VAT
            let subtotalBeforeVat = 0;
            const items = data.items.map(item => {
                const subtotal = item.quantity_ordered * item.unit_price;
                subtotalBeforeVat += subtotal;
                return { ...item, subtotal };
            });

            const vatRate = data.is_vat_inclusive ? (data.vat_rate ?? 15) : 0;
            const vatAmount = data.is_vat_inclusive ? (subtotalBeforeVat * vatRate) / 100 : 0;
            const totalAmount = subtotalBeforeVat + vatAmount;

            // Create PO
            const po = manager.create(PurchaseOrder, {
                po_number: poNumber,
                supplier_id: data.supplier_id,
                subtotal_before_vat: subtotalBeforeVat,
                vat_amount: vatAmount,
                vat_rate: vatRate,
                is_vat_inclusive: data.is_vat_inclusive || false,
                total_amount: totalAmount,
                notes: data.notes,
                expected_delivery: data.expected_delivery ? new Date(data.expected_delivery) : undefined,
                payment_method: data.payment_method || POPaymentMethod.CASH,
                created_by: userId,
                organization_id,
                // Cheque fields (only relevant when payment_method === CHEQUE)
                cheque_bank_name: data.cheque_bank_name || undefined,
                cheque_number: data.cheque_number || undefined,
                cheque_issue_date: data.cheque_issue_date ? new Date(data.cheque_issue_date) : undefined,
                cheque_due_date: data.cheque_due_date ? new Date(data.cheque_due_date) : undefined,
                cheque_amount: data.cheque_amount || undefined,
            });
            const savedPO = await manager.save(po);

            // Notify cashiers that a PO needs payment
            this.notificationsService.create({
                title: 'New Purchase Order',
                message: `Purchase Order ${poNumber} has been created and requires cashier payment approval.`,
                type: NotificationType.PURCHASE_ORDER,
                organization_id,
            }).catch(err => console.error('PO notification error:', err));

            // Phase 1.5: Expiry Risk Blocking - Pre-fetch risk data for all medicines
            const riskData = await this.expiryIntelligenceService.calculateExpiryRisk();

            // Create PO items
            for (const item of items) {
                // Rule 3.3: Over-Purchase Prevention
                const medicine = await manager.findOne(Medicine, {
                    where: { id: item.medicine_id, organization_id },
                    relations: ['batches']
                });
                
                // Note: Over-purchase and expiry checks removed — pharmacist may order any quantity.

                const poItem = manager.create(PurchaseOrderItem, {
                    purchase_order_id: savedPO.id,
                    medicine_id: item.medicine_id,
                    quantity_ordered: item.quantity_ordered,
                    unit_price: item.unit_price,
                    subtotal: item.subtotal,
                    organization_id,
                });
                await manager.save(poItem);
            }

            return savedPO;
        });
    }

    async updateStatus(id: string, status: POStatus, userId: string) {
        const po = await this.findOne(id);

        // Validate status transitions
        const validTransitions: Record<POStatus, POStatus[]> = {
            [POStatus.DRAFT]: [POStatus.APPROVED, POStatus.SENT, POStatus.CONFIRMED, POStatus.CANCELLED, POStatus.PENDING_PAYMENT],
            [POStatus.PENDING_PAYMENT]: [POStatus.APPROVED, POStatus.SENT, POStatus.CONFIRMED, POStatus.CANCELLED],
            [POStatus.APPROVED]: [POStatus.SENT, POStatus.CONFIRMED, POStatus.CANCELLED],
            [POStatus.SENT]: [POStatus.CONFIRMED, POStatus.CANCELLED],
            [POStatus.CONFIRMED]: [POStatus.PARTIALLY_RECEIVED, POStatus.COMPLETED, POStatus.CANCELLED],
            [POStatus.PARTIALLY_RECEIVED]: [POStatus.COMPLETED, POStatus.CANCELLED],
            [POStatus.COMPLETED]: [],
            [POStatus.CANCELLED]: [],
        };

        if (!validTransitions[po.status]?.includes(status)) {
            throw new BadRequestException(`Cannot transition from ${po.status} to ${status}`);
        }

        if (status === POStatus.APPROVED) {
            po.approved_by = userId;
        }

        po.status = status;
        return this.poRepo.save(po); // po already verified in findOne
    }

    // ─── Goods Receipt ────────────────────────────────
    async receiveGoods(
        poId: string,
        items: Array<{ po_item_id: string; quantity_received: number; batch_number: string; expiry_date: string; selling_price?: number }>,
        userId: string,
        notes?: string,
    ) {
        const organization_id = getTenantId();
        try {
            return await this.dataSource.transaction(async (manager) => {
                const po = await manager.findOne(PurchaseOrder, { 
                    where: { id: poId, organization_id } 
                });
                if (!po) throw new NotFoundException('PO not found');

                // Enforce strictly that goods cannot be received unless payment is settled by the Cashier.
                if (po.payment_status !== POPaymentStatus.PAID) {
                    throw new BadRequestException('Cannot receive goods before the cashier processes payment.');
                }

                // Generate unique GRN number (format: GRN-YYYYMMDD-XXXX)
                const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
                const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
                const grnNumber = `GRN-${dateStr}-${randomStr}`;

                // Create goods receipt
                const gr = manager.create(GoodsReceipt, {
                    purchase_order_id: poId,
                    received_by: userId,
                    grn_number: grnNumber,
                    notes,
                    organization_id,
                });
                const savedGR = await manager.save(gr);

                for (const item of items) {
                    // Update PO item received qty
                    const poItem = await manager.findOne(PurchaseOrderItem, { 
                        where: { id: item.po_item_id, organization_id } 
                    });
                    if (!poItem) continue;

                    poItem.quantity_received += item.quantity_received;
                    await manager.save(poItem);

                    // Auto-create batch OR update existing batch (upsert logic)
                    const existingBatch = await manager.findOne(Batch, {
                        where: {
                            batch_number: item.batch_number,
                            medicine_id: poItem.medicine_id,
                            organization_id,
                        }
                    });

                    let savedBatch: Batch;
                    if (existingBatch) {
                        // Update existing batch quantities
                        existingBatch.initial_quantity = Number(existingBatch.initial_quantity) + item.quantity_received;
                        existingBatch.quantity_remaining = Number(existingBatch.quantity_remaining) + item.quantity_received;
                        if (item.selling_price && item.selling_price > 0) {
                            existingBatch.selling_price = item.selling_price;
                        }
                        // Update purchase price to latest
                        existingBatch.purchase_price = poItem.unit_price;
                        savedBatch = await manager.save(existingBatch);
                    } else {
                        // Create new batch
                        const batch = manager.create(Batch, {
                            batch_number: item.batch_number,
                            medicine_id: poItem.medicine_id,
                            expiry_date: new Date(item.expiry_date),
                            purchase_price: poItem.unit_price,
                            selling_price: item.selling_price || 0,
                            initial_quantity: item.quantity_received,
                            quantity_remaining: item.quantity_received,
                            supplier_id: po.supplier_id,
                            organization_id,
                        });
                        savedBatch = await manager.save(batch);
                    }

                    // Record stock transaction
                    const tx = manager.create(StockTransaction, {
                        batch_id: savedBatch.id,
                        type: TransactionType.IN,
                        quantity: item.quantity_received,
                        reference_type: ReferenceType.PURCHASE,
                        reference_id: savedGR.id,
                        created_by: userId,
                        organization_id,
                    });
                    await manager.save(tx);

                    // Phase 5: Multi-Supplier Price Comparison Support
                    // Record price history for analytics
                    await this.suppliersService.recordPrice(
                        poItem.medicine_id,
                        po.supplier_id,
                        Number(poItem.unit_price)
                    );
                }

                // Update PO status based on received quantities
                const allItems = await manager.find(PurchaseOrderItem, { 
                    where: { purchase_order_id: poId, organization_id } 
                });
                const allFullyReceived = allItems.every(i => i.quantity_received >= i.quantity_ordered);
                const anyReceived = allItems.some(i => i.quantity_received > 0);

                if (allFullyReceived) {
                    po.status = POStatus.COMPLETED;
                } else if (anyReceived) {
                    po.status = POStatus.PARTIALLY_RECEIVED;
                }
                await manager.save(po);

                return savedGR;
            });
        } catch (err) {
            if (err instanceof QueryFailedError && err.message.includes('unique constraint')) {
                if (err.message.includes('goods_receipts')) {
                    throw new BadRequestException('A collision occurred generating the GRN number. Please try again.');
                }
            }
            throw err;
        }
    }

    async getReceipts(poId: string) {
        return this.grRepo.find({
            where: { purchase_order_id: poId, organization_id: getTenantId() },
            order: { received_at: 'DESC' },
        });
    }

    // ─── Dashboard ────────────────────────────────────
    async getSummary() {
        const organization_id = getTenantId();
        const total = await this.poRepo.count({ where: { organization_id } });
        const draft = await this.poRepo.count({ where: { status: POStatus.DRAFT, organization_id } });
        const pending = await this.poRepo.count({ where: { status: POStatus.SENT, organization_id } });
        const confirmed = await this.poRepo.count({ where: { status: POStatus.CONFIRMED, organization_id } });

        const totalValue = await this.poRepo
            .createQueryBuilder('po')
            .select('COALESCE(SUM(po.total_amount), 0)', 'total')
            .where('po.status != :status', { status: POStatus.CANCELLED })
            .andWhere('po.organization_id = :organization_id', { organization_id })
            .getRawOne();

        const pendingPayment = await this.poRepo.count({ where: { status: POStatus.PENDING_PAYMENT, organization_id } });

        return {
            total_orders: total,
            draft_count: draft,
            pending_count: pending,
            confirmed_count: confirmed,
            pending_payment_count: pendingPayment,
            total_value: parseFloat(totalValue?.total) || 0,
        };
    }

    // ─── Cheque Reminder Check ────────────────────────────────────
    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async checkChequeReminders(): Promise<{ checked: number; alerts: number }> {
        const orgStore = await this.organizationsService.findAll();
        let totalChecked = 0;
        let totalAlerts = 0;

        for (const org of orgStore) {
            if (!org.is_active) continue;

            const res = await tenantStorage.run({ 
                organizationId: org.id, 
                userId: 'SYSTEM', 
                isSuperAdmin: false 
            }, async () => {
                return this.runChequeCheckForCurrentTenant();
            });

            totalChecked += res.checked;
            totalAlerts += res.alerts;
        }

        return { checked: totalChecked, alerts: totalAlerts };
    }

    private async runChequeCheckForCurrentTenant(): Promise<{ checked: number; alerts: number }> {
        const today = new Date();
        const organization_id = getTenantId();
        today.setHours(0, 0, 0, 0);

        const chequePOs = await this.poRepo
            .createQueryBuilder('po')
            .leftJoinAndSelect('po.supplier', 'supplier')
            .where('po.payment_method = :method', { method: POPaymentMethod.CHEQUE })
            .andWhere('po.organization_id = :organization_id', { organization_id })
            .andWhere('po.cheque_due_date IS NOT NULL')
            .andWhere('po.status NOT IN (:...exclude)', { exclude: [POStatus.CANCELLED] })
            .andWhere('po.payment_status != :paid', { paid: 'PAID' })
            .getMany();

        let alertsCreated = 0;
        const AlertsService = (await import('../alerts/alerts.service')).AlertsService;

        for (const po of chequePOs) {
            const dueDate = new Date(po.cheque_due_date);
            dueDate.setHours(0, 0, 0, 0);
            const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            let alertMessage: string | null = null;
            if (daysUntilDue === 7) {
                alertMessage = `⚠️ Cheque Due in 7 Days: PO ${po.po_number} — Bank: ${po.cheque_bank_name || 'N/A'}, Cheque #${po.cheque_number || 'N/A'}, Amount: ETB ${po.cheque_amount || po.total_amount}. Due: ${dueDate.toLocaleDateString()}`;
            } else if (daysUntilDue === 3) {
                alertMessage = `🔔 Cheque Due in 3 Days: PO ${po.po_number} — Bank: ${po.cheque_bank_name || 'N/A'}, Cheque #${po.cheque_number || 'N/A'}, Amount: ETB ${po.cheque_amount || po.total_amount}. Due: ${dueDate.toLocaleDateString()}`;
            } else if (daysUntilDue === 0) {
                alertMessage = `🚨 Cheque DUE TODAY: PO ${po.po_number} — Bank: ${po.cheque_bank_name || 'N/A'}, Cheque #${po.cheque_number || 'N/A'}, Amount: ETB ${po.cheque_amount || po.total_amount}. Action required!`;
            } else if (daysUntilDue < 0) {
                alertMessage = `🚨 OVERDUE Cheque: PO ${po.po_number} — Bank: ${po.cheque_bank_name || 'N/A'}, Cheque #${po.cheque_number || 'N/A'}, was due ${dueDate.toLocaleDateString()}. ETB ${po.cheque_amount || po.total_amount}`;
            }

            if (alertMessage) {
                // Use AlertsService to record urgent alert
                console.log('[CHEQUE REMINDER]', alertMessage);
                alertsCreated++;
            }
        }

        return { checked: chequePOs.length, alerts: alertsCreated };
    }

    // ─── Cashier Payment for PO ──────────────────────────────
    async recordPayment(poId: string, data: {
        payment_account_id: string;
        amount: number;
    }, cashierUserId: string) {
        const organization_id = getTenantId();
        return this.dataSource.transaction(async (manager) => {
            const po = await manager.findOne(PurchaseOrder, {
                where: { id: poId, organization_id },
            });
            if (!po) throw new NotFoundException('Purchase order not found');

            const paymentAccount = await manager.findOne(PaymentAccount, {
                where: { id: data.payment_account_id, organization_id },
            });
            if (!paymentAccount) throw new NotFoundException('Payment account not found');

            const amount = Number(data.amount);
            if (Number(paymentAccount.balance) < amount) {
                throw new BadRequestException('Insufficient funds in the selected payment account');
            }

            // Deduct from payment account
            paymentAccount.balance = Number(paymentAccount.balance) - amount;
            await manager.save(paymentAccount);

            // Log transaction
            const tx = manager.create(PaymentAccountTransaction, {
                payment_account_id: paymentAccount.id,
                amount,
                type: PATransactionType.DEBIT,
                reference_type: PAReferenceType.PURCHASE,
                reference_id: po.id,
                description: `Payment for PO ${po.po_number}`,
                created_by: cashierUserId,
                organization_id,
            });
            await manager.save(tx);

            // Update PO payment status
            po.total_paid = Number(po.total_paid) + amount;
            po.paid_by = cashierUserId;
            po.payment_account_id = data.payment_account_id;
            if (po.total_paid >= po.total_amount) {
                po.payment_status = POPaymentStatus.PAID;
                if (po.status === POStatus.PENDING_PAYMENT) {
                    po.status = POStatus.CONFIRMED;
                }
            } else {
                po.payment_status = POPaymentStatus.PARTIALLY_PAID;
            }
            await manager.save(po);

            // Notify the PO creator
            if (po.created_by) {
                this.notificationsService.create({
                    title: 'PO Payment Recorded',
                    message: `Payment of ETB ${amount.toLocaleString()} recorded for PO ${po.po_number} via ${paymentAccount.name}.`,
                    type: NotificationType.PURCHASE_ORDER,
                    user_id: po.created_by,
                    organization_id,
                }).catch(err => console.error('PO payment notification error:', err));
            }

            return po;
        });
    }

    async findPendingPayment() {
        const organization_id = getTenantId();
        return this.poRepo.find({
            where: { organization_id, payment_status: POPaymentStatus.PENDING },
            relations: ['supplier', 'created_by_user'],
            order: { created_at: 'ASC' },
        });
    }
}
