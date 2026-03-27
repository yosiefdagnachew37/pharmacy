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
        private forecastingService: ForecastingService,
        private expiryIntelligenceService: ExpiryIntelligenceService,
        private dataSource: DataSource,
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

            // Calculate total
            let totalAmount = 0;
            const items = data.items.map(item => {
                const subtotal = item.quantity_ordered * item.unit_price;
                totalAmount += subtotal;
                return { ...item, subtotal };
            });

            // Create PO
            const po = manager.create(PurchaseOrder, {
                po_number: poNumber,
                supplier_id: data.supplier_id,
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

            // Create PO items
            for (const item of items) {
                // Rule 3.3: Over-Purchase Prevention
                const medicine = await manager.findOne(Medicine, {
                    where: { id: item.medicine_id, organization_id },
                    relations: ['batches']
                });
                // Phase 1.5: Expiry Risk Blocking
                const riskData = await this.expiryIntelligenceService.calculateExpiryRisk();
                const medRisk = riskData.find(r => r.medicine_id === item.medicine_id && r.risk_status === 'CRITICAL');
                if (medRisk) {
                    throw new BadRequestException(`Purchase blocked: ${medicine?.name} is at CRITICAL expiry risk (Score: ${medRisk.risk_score}). Suggest supplier return instead of new purchase.`);
                }

                if (medicine) {
                    const currentStock = (medicine.batches || []).reduce((sum, b) => sum + Number(b.quantity_remaining || 0), 0);
                    const forecasted60DayDemand = await this.forecastingService.getForecastedDemand(item.medicine_id, 60);

                    if (forecasted60DayDemand > 0 && (currentStock + item.quantity_ordered) > (forecasted60DayDemand * 1.2)) {
                        throw new BadRequestException(`Over-purchase prevention: Ordering ${item.quantity_ordered} for ${medicine.name} would exceed 120% of 60-day forecasted demand (${forecasted60DayDemand}).`);
                    }
                }

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
            [POStatus.DRAFT]: [POStatus.APPROVED, POStatus.SENT, POStatus.CONFIRMED, POStatus.CANCELLED],
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

                    // Auto-create batch
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
                    const savedBatch = await manager.save(batch);

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
                if (err.message.includes('batches')) {
                    throw new BadRequestException('One or more batch numbers already exist for their respective medicines.');
                }
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

        return {
            total_orders: total,
            draft_count: draft,
            pending_count: pending,
            confirmed_count: confirmed,
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
}
