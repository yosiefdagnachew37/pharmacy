import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierContract } from './entities/supplier-contract.entity';
import { SupplierPerformance } from './entities/supplier-performance.entity';
import { PriceHistory } from './entities/price-history.entity';
import { SupplierPayment } from './entities/supplier-payment.entity';
import { PurchaseOrder, POPaymentStatus } from '../purchase-orders/entities/purchase-order.entity';
import { User } from '../users/entities/user.entity';
import { getTenantId } from '../../common/utils/tenant-query';

@Injectable()
export class SuppliersService {
    constructor(
        @InjectRepository(Supplier)
        private readonly supplierRepo: Repository<Supplier>,
        @InjectRepository(SupplierContract)
        private readonly contractRepo: Repository<SupplierContract>,
        @InjectRepository(SupplierPerformance)
        private readonly performanceRepo: Repository<SupplierPerformance>,
        @InjectRepository(PriceHistory)
        private readonly priceHistoryRepo: Repository<PriceHistory>,
        @InjectRepository(SupplierPayment)
        private readonly paymentRepo: Repository<SupplierPayment>,
        @InjectRepository(PurchaseOrder)
        private readonly poRepo: Repository<PurchaseOrder>,
    ) { }

    // ─── Supplier CRUD ─────────────────────────────────
    async findAll() {
        return this.supplierRepo.find({ 
            where: { organization_id: getTenantId() },
            order: { name: 'ASC' } 
        });
    }

    async findOne(id: string) {
        const supplier = await this.supplierRepo.findOne({ 
            where: { id, organization_id: getTenantId() } 
        });
        if (!supplier) throw new NotFoundException('Supplier not found');
        return supplier;
    }

    async create(data: Partial<Supplier>) {
        const supplier = this.supplierRepo.create({
            ...data,
            organization_id: getTenantId(),
        });
        return this.supplierRepo.save(supplier);
    }

    async update(id: string, data: Partial<Supplier>) {
        await this.findOne(id); // findOne handles tenant check
        await this.supplierRepo.update({ id, organization_id: getTenantId() }, data);
        return this.findOne(id);
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.supplierRepo.delete({ id, organization_id: getTenantId() });
        return { deleted: true };
    }

    // ─── Contract CRUD ─────────────────────────────────
    async getContracts(supplierId: string) {
        return this.contractRepo.find({
            where: { supplier_id: supplierId, organization_id: getTenantId() },
            order: { effective_date: 'DESC' },
        });
    }

    async createContract(supplierId: string, data: Partial<SupplierContract>) {
        await this.findOne(supplierId);
        const contract = this.contractRepo.create({ 
            ...data, 
            supplier_id: supplierId,
            organization_id: getTenantId(),
        });
        return this.contractRepo.save(contract);
    }

    async deleteContract(id: string) {
        const orgId = getTenantId();
        const contract = await this.contractRepo.findOne({ where: { id, organization_id: orgId } });
        if (!contract) throw new NotFoundException('Contract not found');
        await this.contractRepo.delete({ id, organization_id: orgId });
        return { deleted: true };
    }

    // ─── Performance ───────────────────────────────────
    async getPerformance(supplierId: string) {
        return this.performanceRepo.find({
            where: { supplier_id: supplierId, organization_id: getTenantId() },
            order: { period: 'DESC' },
        });
    }

    async recordPerformance(supplierId: string, data: Partial<SupplierPerformance>) {
        await this.findOne(supplierId);
        const perf = this.performanceRepo.create({ 
            ...data, 
            supplier_id: supplierId,
            organization_id: getTenantId(),
        });
        
        // Auto-calculate composite score
        perf.computed_score = this.calculateScore(perf);

        return this.performanceRepo.save(perf);
    }

    /**
     * Supplier Performance Scoring Algorithm
     * Score = (Delivery Reliability × 0.35)
     *       + (Price Stability × 0.25)
     *       + (Credit Flexibility × 0.15)
     *       + (Return Cooperation × 0.15)
     *       + (Quality Rating × 0.10)
     */
    calculateScore(perf: SupplierPerformance): number {
        const deliveryReliability = perf.total_deliveries > 0
            ? perf.on_time_deliveries / perf.total_deliveries
            : 0;

        const priceStability = Math.max(0, 1 - Math.abs(perf.price_variance || 0));

        const returnCooperation = perf.total_items > 0
            ? 1 - (perf.returned_items / perf.total_items)
            : 1;

        const qualityScore = (perf.quality_rating || 3) / 5;

        // Credit flexibility is derived from supplier's credit limit vs average order
        // For now use a default of 0.5 since we don't have order data here
        const creditFlexibility = 0.5;

        const score =
            deliveryReliability * 0.35 +
            priceStability * 0.25 +
            creditFlexibility * 0.15 +
            returnCooperation * 0.15 +
            qualityScore * 0.10;

        return Math.round(score * 100) / 100;
    }

    // ─── Price History ─────────────────────────────────
    async getPriceHistory(medicineId: string, supplierId?: string) {
        const query: any = { medicine_id: medicineId, organization_id: getTenantId() };
        if (supplierId) query.supplier_id = supplierId;

        return this.priceHistoryRepo.find({
            where: query,
            order: { recorded_at: 'DESC' },
            relations: ['supplier'],
        });
    }

    async recordPrice(medicineId: string, supplierId: string, unitPrice: number) {
        const record = this.priceHistoryRepo.create({
            medicine_id: medicineId,
            supplier_id: supplierId,
            unit_price: unitPrice,
            organization_id: getTenantId(),
        });
        return this.priceHistoryRepo.save(record);
    }

    // ─── Supplier Ranking ──────────────────────────────
    async getSupplierRanking(limit = 5) {
        // Get latest performance for each supplier (scoped to tenant)
        const suppliers = await this.supplierRepo.find({
            where: { is_active: true, organization_id: getTenantId() },
            order: { name: 'ASC' },
        });

        const rankings: Array<{
            id: string;
            name: string;
            contact_person: string;
            phone: string;
            score: number;
            quality_rating: number;
            payment_terms: string;
        }> = [];
        for (const supplier of suppliers) {
            const latestPerf = await this.performanceRepo.findOne({
                where: { supplier_id: supplier.id, organization_id: getTenantId() },
                order: { period: 'DESC' },
            });

            rankings.push({
                id: supplier.id,
                name: supplier.name,
                contact_person: supplier.contact_person,
                phone: supplier.phone,
                score: latestPerf?.computed_score ?? 0,
                quality_rating: latestPerf?.quality_rating ?? 0,
                payment_terms: supplier.payment_terms,
            });
        }

        return rankings
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // ─── Supplier Payments ─────────────────────────────
    async getPayments(supplierId?: string, poId?: string) {
        return this.paymentRepo.find({
            where: {
                organization_id: getTenantId(),
                ...(supplierId ? { purchase_order: { supplier_id: supplierId } } : {}),
                ...(poId ? { purchase_order_id: poId } : {}),
            },
            relations: ['purchase_order', 'purchase_order.supplier', 'created_by_user'],
            order: { created_at: 'DESC' },
        });
    }

    async recordPayment(data: {
        purchase_order_id: string;
        amount: number;
        payment_method: any;
        transaction_reference?: string;
        payment_date: Date;
        notes?: string;
        created_by: string;
    }) {
        const po = await this.poRepo.findOne({ 
            where: { id: data.purchase_order_id, organization_id: getTenantId() } 
        });
        if (!po) throw new NotFoundException('Purchase Order not found');

        const payment = this.paymentRepo.create({
            ...data,
            organization_id: getTenantId(),
        });
        const savedPayment = await this.paymentRepo.save(payment);

        // Update PO stats
        po.total_paid = Number(po.total_paid || 0) + Number(data.amount);
        if (po.total_paid >= po.total_amount) {
            po.payment_status = POPaymentStatus.PAID;
        } else if (po.total_paid > 0) {
            po.payment_status = POPaymentStatus.PARTIALLY_PAID;
        }

        await this.poRepo.save(po);

        return savedPayment;
    }
}
