import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, QueryFailedError } from 'typeorm';
import { Sale, PaymentMethod } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SaleOrder, SaleOrderStatus } from './entities/sale-order.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateSaleOrderDto, ConfirmSaleOrderDto } from './dto/create-sale-order.dto';
import { StockService } from '../stock/stock.service';
import { ReferenceType } from '../stock/entities/stock-transaction.entity';
import { AlertsService } from '../alerts/alerts.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { CreditService } from '../credit/credit.service';
import { Refund } from './entities/refund.entity';
import { CreditStatus } from '../credit/entities/credit-record.entity';
import { PaymentAccount } from '../payment-accounts/entities/payment-account.entity';
import { PaymentAccountTransaction, TransactionType as PATransactionType, ReferenceType as PAReferenceType } from '../payment-accounts/entities/payment-account-transaction.entity';
import { getTenantId } from '../../common/utils/tenant-query';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private readonly salesRepository: Repository<Sale>,
        @InjectRepository(SaleItem)
        private readonly itemsRepository: Repository<SaleItem>,
        @InjectRepository(Refund)
        private readonly refundRepository: Repository<Refund>,
        @InjectRepository(SaleOrder)
        private readonly saleOrderRepository: Repository<SaleOrder>,
        private readonly stockService: StockService,
        private readonly alertsService: AlertsService,
        private readonly notificationsService: NotificationsService,
        private readonly creditService: CreditService,
        private dataSource: DataSource,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────────
    // SALE ORDER WORKFLOW (Pharmacist → Cashier)
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Step 1: Pharmacist creates a pending sale order.
     * No stock is deducted at this point.
     */
    async createOrder(dto: CreateSaleOrderDto, userId: string): Promise<SaleOrder> {
        const organization_id = getTenantId();

        // Generate order number
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const order_number = `ORD-${dateStr}-${randomStr}`;

        const order = this.saleOrderRepository.create({
            order_number,
            items: dto.items,
            total_amount: dto.total_amount,
            discount: dto.discount ?? 0,
            patient_id: dto.patient_id,
            prescription_image_url: dto.prescription_image_url,
            is_controlled_transaction: dto.is_controlled_transaction ?? false,
            status: SaleOrderStatus.PENDING,
            created_by: userId,
            organization_id,
        });

        return this.saleOrderRepository.save(order);
    }

    /**
     * Step 2: Cashier confirms the order — executes payment, deducts stock,
     * records the amount in the payment account, and creates the finalized Sale.
     */
    async confirmOrder(orderId: string, dto: ConfirmSaleOrderDto, userId: string): Promise<Sale> {
        const organization_id = getTenantId();

        const order = await this.saleOrderRepository.findOne({
            where: { id: orderId, organization_id },
        });
        if (!order) throw new NotFoundException('Sale order not found');
        if (order.status !== SaleOrderStatus.PENDING) {
            throw new BadRequestException(`Order is already ${order.status.toLowerCase()}.`);
        }

        // Mark order as confirmed immediately to prevent double-confirm
        order.status = SaleOrderStatus.CONFIRMED;
        order.confirmed_by = userId;
        order.confirmed_at = new Date();
        order.payment_account_id = dto.payment_account_id || '';
        order.payment_account_name = dto.payment_account_name || '';
        await this.saleOrderRepository.save(order);

        try {
            // Execute the sale inside a transaction (stock deduction + sale creation)
            const sale = await this.dataSource.transaction(async (manager) => {
                const medIds = order.items.map((i: any) => i.medicine_id);
                const medicines = await manager.getRepository(Medicine).find({
                    where: { id: In(medIds), organization_id },
                });

                const hasControlled = medicines.some(m => m.is_controlled);

                // Generate unique receipt number
                const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
                const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
                const receiptNumber = `RCPT-${dateStr}-${randomStr}`;

                let paidAmount = 0;
                let creditAmount = 0;

                const finalPaymentMethod = (dto.payment_method as PaymentMethod) || PaymentMethod.CASH;

                if (finalPaymentMethod === PaymentMethod.CREDIT) {
                    creditAmount = Number(order.total_amount);
                } else if (finalPaymentMethod === PaymentMethod.SPLIT) {
                    paidAmount = Number(dto.amount_paid || 0);
                    creditAmount = Number(order.total_amount) - paidAmount;
                } else {
                    paidAmount = Number(order.total_amount);
                }

                const splitData = finalPaymentMethod === PaymentMethod.SPLIT ? 
                    [
                        { method: PaymentMethod.CASH, amount: paidAmount },
                        { method: PaymentMethod.CREDIT, amount: creditAmount }
                    ] : [];

                const saleHeader = manager.create(Sale, {
                    receipt_number: receiptNumber,
                    patient_id: order.patient_id,
                    total_amount: order.total_amount,
                    discount: order.discount,
                    payment_method: finalPaymentMethod,
                    split_payments: splitData,
                    prescription_image_url: order.prescription_image_url,
                    is_controlled_transaction: hasControlled,
                    created_by: order.created_by,
                    organization_id,
                });

                (saleHeader as any).payment_account_id = dto.payment_account_id;
                (saleHeader as any).payment_account_name = dto.payment_account_name;
                (saleHeader as any).confirmed_by = userId;

                const savedSale = await manager.save(saleHeader);

                if (creditAmount > 0) {
                    if (!order.patient_id) {
                        throw new BadRequestException('A registered customer/patient is required for credit sales.');
                    }
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 30);
                    await this.creditService.recordCreditSale(
                        order.patient_id,
                        savedSale.id,
                        creditAmount,
                        dueDate,
                        `Credit sale generated from POS Checkout`,
                        manager
                    );
                }

                if (paidAmount > 0 && dto.payment_account_id) {
                    const paymentAccount = await manager.findOne(PaymentAccount, {
                        where: { id: dto.payment_account_id, organization_id }
                    });
                    if (paymentAccount) {
                        paymentAccount.balance = Number(paymentAccount.balance || 0) + paidAmount;
                        await manager.save(paymentAccount);

                        const accountTransaction = manager.create(PaymentAccountTransaction, {
                            payment_account_id: paymentAccount.id,
                            amount: paidAmount,
                            type: PATransactionType.CREDIT,
                            reference_type: PAReferenceType.SALE,
                            reference_id: savedSale.id,
                            description: `Sale Receipt: ${receiptNumber}${finalPaymentMethod === PaymentMethod.SPLIT ? ' (Upfront paid)' : ''}`,
                            created_by: userId,
                            organization_id,
                        });
                        await manager.save(accountTransaction);
                    }
                }

                // Process each item — respect batch selection if pharmacist chose a specific one
                for (const item of order.items as any[]) {
                    let transactions: any[];

                    if (item.batch_id) {
                        // Pharmacist chose a specific batch (FEFO override) — use stock override
                        transactions = [await this.stockService.issueStockWithOverride(
                            item.batch_id,
                            item.quantity,
                            ReferenceType.SALE,
                            savedSale.id,
                            userId,
                            'Batch selected by pharmacist in POS',
                        )].flat();

                        const saleItem = manager.create(SaleItem, {
                            sale_id: savedSale.id,
                            medicine_id: item.medicine_id,
                            batch_id: item.batch_id,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            subtotal: item.quantity * item.unit_price,
                            organization_id,
                        });
                        await manager.save(saleItem);
                    } else {
                        // Default FEFO issuance
                        transactions = await this.stockService.issueStock(
                            item.medicine_id,
                            item.quantity,
                            ReferenceType.SALE,
                            savedSale.id,
                            userId,
                        );

                        for (const tx of transactions) {
                            const saleItem = manager.create(SaleItem, {
                                sale_id: savedSale.id,
                                medicine_id: item.medicine_id,
                                batch_id: tx.batch_id,
                                quantity: tx.quantity,
                                unit_price: item.unit_price,
                                subtotal: tx.quantity * item.unit_price,
                                organization_id,
                            });
                            await manager.save(saleItem);
                        }
                    }
                }

                const finalSale = await manager.findOne(Sale, {
                    where: { id: savedSale.id, organization_id },
                    relations: ['items', 'items.medicine', 'items.batch', 'patient'],
                });

                if (!finalSale) throw new Error('Sale creation failed');
                return finalSale;
            });

            // Update order with the resulting sale id
            await this.saleOrderRepository.update(orderId, { sale_id: sale.id });

            // Trigger async side effects
            this.alertsService.checkLowStock().catch(err =>
                console.error('Error in reactive stock check:', err),
            );
            this.notificationsService.create({
                title: 'Sale Confirmed',
                message: `Order ${order.order_number} confirmed. Receipt: ${sale.receipt_number}`,
                type: NotificationType.SALE,
            }).catch(err => console.error('Error creating sale notification:', err));

            return sale;
        } catch (err) {
            // Rollback order status on failure so it can be retried
            await this.saleOrderRepository.update(orderId, { status: SaleOrderStatus.PENDING, confirmed_by: null as any, confirmed_at: null as any });
            throw err;
        }
    }

    /** Cancel a pending order */
    async cancelOrder(orderId: string, userId: string): Promise<SaleOrder> {
        const organization_id = getTenantId();
        const order = await this.saleOrderRepository.findOne({
            where: { id: orderId, organization_id },
        });
        if (!order) throw new NotFoundException('Sale order not found');
        if (order.status !== SaleOrderStatus.PENDING) {
            throw new BadRequestException(`Only PENDING orders can be cancelled. This order is ${order.status}.`);
        }
        order.status = SaleOrderStatus.CANCELLED;
        return this.saleOrderRepository.save(order);
    }

    /** Get all pending orders for the cashier queue (polling) */
    async findPendingOrders(): Promise<SaleOrder[]> {
        return this.saleOrderRepository.find({
            where: { status: SaleOrderStatus.PENDING, organization_id: getTenantId() },
            relations: ['creator', 'patient'],
            order: { created_at: 'ASC' },
        });
    }

    /** Get all orders (for pharmacist "my orders" view) */
    async findMyOrders(userId: string): Promise<SaleOrder[]> {
        return this.saleOrderRepository.find({
            where: { created_by: userId, organization_id: getTenantId() },
            relations: ['creator', 'patient', 'confirmer'],
            order: { created_at: 'DESC' },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // DIRECT SALE (Admin / legacy path — still supported)
    // ─────────────────────────────────────────────────────────────────────────────

    async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
        const { items, total_price, payment_method, ...rest } = createSaleDto;

        try {
            const sale = await this.dataSource.transaction(async (manager) => {
                // 0. Check for Controlled Substances (Scoped)
                const medIds = items.map(i => i.medicine_id);
                const medicines = await manager.getRepository(Medicine).find({
                    where: { id: In(medIds), organization_id: getTenantId() }
                });

                const hasControlled = medicines.some(m => m.is_controlled);
                if (hasControlled && !createSaleDto.prescription_image_url && !createSaleDto.prescription_id) {
                    throw new BadRequestException('Prescription (upload or link) is required for controlled substances.');
                }

                // 1. Create Sale Header
                const finalPaymentMethod = (payment_method as PaymentMethod) || PaymentMethod.CASH;

                // Generate unique receipt number (format: RCPT-YYYYMMDD-XXXX)
                const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
                const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
                const receiptNumber = `RCPT-${dateStr}-${randomStr}`;

                const saleHeader = manager.create(Sale, {
                    ...rest,
                    receipt_number: receiptNumber,
                    total_amount: total_price,
                    payment_method: finalPaymentMethod,
                    split_payments: createSaleDto.split_payments as { method: PaymentMethod; amount: number }[],
                    prescription_image_url: createSaleDto.prescription_image_url,
                    is_controlled_transaction: hasControlled,
                    created_by: userId,
                    organization_id: getTenantId(),
                });
                const savedSale = await manager.save(saleHeader);

                // If it's a credit sale, ensure we have a patient/customer ID and record it
                let creditAmount = 0;
                if (finalPaymentMethod === PaymentMethod.CREDIT) {
                    creditAmount = total_price;
                } else if (finalPaymentMethod === PaymentMethod.SPLIT && createSaleDto.split_payments) {
                    const creditSplit = createSaleDto.split_payments.find(p => p.method === PaymentMethod.CREDIT);
                    if (creditSplit) creditAmount = creditSplit.amount;
                }

                if (creditAmount > 0) {
                    if (!rest.patient_id) {
                        throw new BadRequestException('A registered customer/patient is required for credit sales.');
                    }
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() + 30);
                    await this.creditService.recordCreditSale(
                        rest.patient_id,
                        savedSale.id,
                        creditAmount,
                        dueDate,
                        `Credit sale automatically logged from POS`,
                        manager
                    );
                }

                // 2. Process Items and Reduce Stock
                for (const item of items) {
                    const transactions = await this.stockService.issueStock(
                        item.medicine_id,
                        item.quantity,
                        ReferenceType.SALE,
                        savedSale.id,
                        userId
                    );

                    for (const tx of transactions) {
                        const saleItem = manager.create(SaleItem, {
                            sale_id: savedSale.id,
                            medicine_id: item.medicine_id,
                            batch_id: tx.batch_id,
                            quantity: tx.quantity,
                            unit_price: item.unit_price,
                            subtotal: tx.quantity * item.unit_price,
                            organization_id: getTenantId(),
                        });
                        await manager.save(saleItem);
                    }
                }

                const finalSale = await manager.findOne(Sale, {
                    where: { id: savedSale.id, organization_id: getTenantId() },
                    relations: ['items', 'items.medicine', 'items.batch', 'patient'],
                });

                if (!finalSale) throw new Error('Sale creation failed');
                return finalSale;
            });

            this.alertsService.checkLowStock().catch(err =>
                console.error('Error in reactive stock check:', err)
            );
            this.notificationsService.create({
                title: 'New Sale Completed',
                message: `A sale of $${sale.total_amount.toLocaleString()} has been processed (Receipt: ${sale.receipt_number || 'N/A'})`,
                type: NotificationType.SALE
            }).catch(err => console.error('Error creating sale notification:', err));

            return sale;
        } catch (err) {
            if (err instanceof QueryFailedError && err.message.includes('unique constraint')) {
                throw new BadRequestException('A collision occurred generating the receipt number. Please try again.');
            }
            throw err;
        }
    }

    async findAll(): Promise<Sale[]> {
        return await this.salesRepository.find({
            where: { organization_id: getTenantId() },
            relations: ['items', 'items.medicine', 'patient', 'user', 'credit_records'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Sale | null> {
        return await this.salesRepository.findOne({
            where: { id, organization_id: getTenantId() },
            relations: ['items', 'items.medicine', 'items.batch', 'patient', 'user', 'credit_records'],
        });
    }

    async processRefund(createRefundDto: any, userId: string): Promise<Refund> {
        const { sale_id, medicine_id, quantity, amount, reason } = createRefundDto;

        return await this.dataSource.transaction(async (manager) => {
            const sale = await manager.findOne(Sale, {
                where: { id: sale_id, organization_id: getTenantId() },
                relations: ['items', 'credit_records']
            });
            if (!sale) throw new NotFoundException('Sale not found');

            const hasUnpaidCredit = (sale.payment_method === PaymentMethod.CREDIT ||
                                     sale.split_payments?.some(p => p.method === PaymentMethod.CREDIT)) &&
                                    sale.credit_records?.some(cr => cr.status !== CreditStatus.PAID);

            if (hasUnpaidCredit) {
                throw new BadRequestException('Refund restricted: the associated credit/debt for this sale must be fully paid before a refund can be processed.');
            }

            const item = sale.items.find(i => i.medicine_id === medicine_id && !i.is_refunded);
            if (!item) throw new BadRequestException('No unrefunded item found for this medicine in this sale');

            if (item.quantity < quantity) throw new BadRequestException('Refund quantity exceeds original sale item quantity');

            const refund = manager.create(Refund, {
                sale_id,
                medicine_id,
                quantity,
                amount,
                reason,
                processed_by_id: userId,
                organization_id: getTenantId(),
            });
            const savedRefund = await manager.save(refund);

            item.is_refunded = true;
            await manager.save(item);

            const allItemsRefunded = sale.items.every(i => i.is_refunded);
            sale.is_refunded = allItemsRefunded;
            sale.refund_amount = Number(sale.refund_amount || 0) + Number(amount);
            await manager.save(sale);

            // Synchronize Refund out of the original Payment Account natively
            const originalTx = await manager.findOne(PaymentAccountTransaction, {
                where: { reference_id: sale_id, reference_type: PAReferenceType.SALE, type: PATransactionType.CREDIT, organization_id: getTenantId() }
            });

            if (originalTx && originalTx.payment_account_id) {
                const paymentAccount = await manager.findOne(PaymentAccount, {
                    where: { id: originalTx.payment_account_id, organization_id: getTenantId() }
                });

                if (paymentAccount) {
                    paymentAccount.balance = Number(paymentAccount.balance || 0) - Number(amount);
                    await manager.save(paymentAccount);

                    const refundTx = manager.create(PaymentAccountTransaction, {
                        payment_account_id: paymentAccount.id,
                        amount: Number(amount),
                        type: PATransactionType.DEBIT,
                        reference_type: PAReferenceType.REFUND,
                        reference_id: sale_id,
                        description: `Refund for Sale ${sale.receipt_number || sale_id}`,
                        created_by: userId,
                        organization_id: getTenantId(),
                    });
                    await manager.save(refundTx);
                }
            }

            const TransactionType = (await import('../stock/entities/stock-transaction.entity')).TransactionType;
            await this.stockService.recordTransaction(
                item.batch_id,
                TransactionType.IN,
                quantity,
                ReferenceType.SALE,
                sale_id,
                userId
            );

            this.notificationsService.create({
                title: 'Sale Refunded',
                message: `Refund of ETB ${amount} processed for Sale ${sale.receipt_number || sale_id}.`,
                type: NotificationType.REFUND,
            }).catch(err => console.error('Error creating refund notification:', err));

            return savedRefund;
        });
    }
}
