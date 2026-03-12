import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PurchaseOrder, POStatus, POPaymentMethod, POPaymentStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { Batch } from '../batches/entities/batch.entity';
import { StockTransaction, TransactionType, ReferenceType } from '../stock/entities/stock-transaction.entity';
import { ForecastingService } from '../forecasting/forecasting.service';
import { Medicine } from '../medicines/entities/medicine.entity';

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
        private forecastingService: ForecastingService,
        private dataSource: DataSource,
    ) { }

    // ─── PO CRUD ──────────────────────────────────────
    async findAll(status?: POStatus) {
        const query: any = {};
        if (status) query.status = status;

        return this.poRepo.find({
            where: query,
            relations: ['supplier'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string) {
        const po = await this.poRepo.findOne({
            where: { id },
            relations: ['supplier'],
        });
        if (!po) throw new NotFoundException('Purchase order not found');
        return po;
    }

    async getItems(poId: string) {
        return this.poItemRepo.find({
            where: { purchase_order_id: poId },
            relations: ['medicine'],
        });
    }

    async create(data: {
        supplier_id: string;
        items: Array<{ medicine_id: string; quantity_ordered: number; unit_price: number }>;
        notes?: string;
        expected_delivery?: string;
        payment_method?: POPaymentMethod;
    }, userId: string) {
        return await this.dataSource.transaction(async (manager) => {
            // Generate PO number
            const count = await manager.count(PurchaseOrder);
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
            });
            const savedPO = await manager.save(po);

            // Create PO items
            for (const item of items) {
                // Rule 3.3: Over-Purchase Prevention
                const medicine = await manager.findOne(Medicine, {
                    where: { id: item.medicine_id },
                    relations: ['batches']
                });
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
            [POStatus.DRAFT]: [POStatus.APPROVED, POStatus.CANCELLED],
            [POStatus.APPROVED]: [POStatus.SENT, POStatus.CANCELLED],
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
        return this.poRepo.save(po);
    }

    // ─── Goods Receipt ────────────────────────────────
    async receiveGoods(
        poId: string,
        items: Array<{ po_item_id: string; quantity_received: number; batch_number: string; expiry_date: string; selling_price?: number }>,
        userId: string,
        notes?: string,
    ) {
        return await this.dataSource.transaction(async (manager) => {
            const po = await manager.findOne(PurchaseOrder, { where: { id: poId } });
            if (!po) throw new NotFoundException('PO not found');

            // Create goods receipt
            const gr = manager.create(GoodsReceipt, {
                purchase_order_id: poId,
                received_by: userId,
                notes,
            });
            const savedGR = await manager.save(gr);

            for (const item of items) {
                // Update PO item received qty
                const poItem = await manager.findOne(PurchaseOrderItem, { where: { id: item.po_item_id } });
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
                });
                await manager.save(tx);
            }

            // Update PO status based on received quantities
            const allItems = await manager.find(PurchaseOrderItem, { where: { purchase_order_id: poId } });
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
    }

    async getReceipts(poId: string) {
        return this.grRepo.find({
            where: { purchase_order_id: poId },
            order: { received_at: 'DESC' },
        });
    }

    // ─── Dashboard ────────────────────────────────────
    async getSummary() {
        const total = await this.poRepo.count();
        const draft = await this.poRepo.count({ where: { status: POStatus.DRAFT } });
        const pending = await this.poRepo.count({ where: { status: POStatus.SENT } });
        const confirmed = await this.poRepo.count({ where: { status: POStatus.CONFIRMED } });

        const totalValue = await this.poRepo
            .createQueryBuilder('po')
            .select('COALESCE(SUM(po.total_amount), 0)', 'total')
            .where('po.status != :status', { status: POStatus.CANCELLED })
            .getRawOne();

        return {
            total_orders: total,
            draft_count: draft,
            pending_count: pending,
            confirmed_count: confirmed,
            total_value: parseFloat(totalValue?.total) || 0,
        };
    }
}
