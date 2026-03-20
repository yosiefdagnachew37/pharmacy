import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, In, QueryFailedError } from 'typeorm';
import { Sale, PaymentMethod } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { StockService } from '../stock/stock.service';
import { ReferenceType } from '../stock/entities/stock-transaction.entity';
import { AlertsService } from '../alerts/alerts.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { CreditService } from '../credit/credit.service';
import { Refund } from './entities/refund.entity';
import { CreditStatus } from '../credit/entities/credit-record.entity';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private readonly salesRepository: Repository<Sale>,
        @InjectRepository(SaleItem)
        private readonly itemsRepository: Repository<SaleItem>,
        @InjectRepository(Refund)
        private readonly refundRepository: Repository<Refund>,
        private readonly stockService: StockService,
        private readonly alertsService: AlertsService,
        private readonly notificationsService: NotificationsService,
        private readonly creditService: CreditService,
        private dataSource: DataSource,
    ) { }

    async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
        const { items, total_price, payment_method, ...rest } = createSaleDto;

        try {
            const sale = await this.dataSource.transaction(async (manager) => {
                // 0. Check for Controlled Substances
                const medIds = items.map(i => i.medicine_id);
                const medicines = await manager.getRepository(Medicine).find({
                    where: { id: In(medIds) }
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
                    dueDate.setDate(dueDate.getDate() + 30); // Default 30 days due date

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
                    // Issue stock using FIFO logic - returns array of transactions (one per batch)
                    const transactions = await this.stockService.issueStock(
                        item.medicine_id,
                        item.quantity,
                        ReferenceType.SALE,
                        savedSale.id,
                        userId
                    );

                    // Create SaleItem records for each batch transaction involved
                    for (const tx of transactions) {
                        const saleItem = manager.create(SaleItem, {
                            sale_id: savedSale.id,
                            medicine_id: item.medicine_id,
                            batch_id: tx.batch_id,
                            quantity: tx.quantity,
                            unit_price: item.unit_price,
                            subtotal: tx.quantity * item.unit_price,
                        });
                        await manager.save(saleItem);
                    }
                }

                const finalSale = await manager.findOne(Sale, {
                    where: { id: savedSale.id },
                    relations: ['items', 'items.medicine', 'items.batch', 'patient'],
                });

                if (!finalSale) throw new Error('Sale creation failed');
                return finalSale;
            });

            // Trigger low stock check after sale (async)
            this.alertsService.checkLowStock().catch(err =>
                console.error('Error in reactive stock check:', err)
            );

            // Notify admins of the new sale
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
            relations: ['items', 'items.medicine', 'patient', 'user', 'credit_records'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Sale | null> {
        return await this.salesRepository.findOne({
            where: { id },
            relations: ['items', 'items.medicine', 'items.batch', 'patient', 'user', 'credit_records'],
        });
    }

    async processRefund(createRefundDto: any, userId: string): Promise<Refund> {
        const { sale_id, medicine_id, quantity, amount, reason } = createRefundDto;

        return await this.dataSource.transaction(async (manager) => {
            const sale = await manager.findOne(Sale, {
                where: { id: sale_id },
                relations: ['items', 'credit_records']
            });
            if (!sale) throw new NotFoundException('Sale not found');

            // 0. Validate Credit Status (Refund restricted until credit is PAID)
            const hasUnpaidCredit = (sale.payment_method === PaymentMethod.CREDIT || 
                                     sale.split_payments?.some(p => p.method === PaymentMethod.CREDIT)) && 
                                    sale.credit_records?.some(cr => cr.status !== CreditStatus.PAID);

            if (hasUnpaidCredit) {
                throw new BadRequestException('Refund restricted: the associated credit/debt for this sale must be fully paid before a refund can be processed.');
            }

            // Find an item that hasn't been refunded yet for this medicine
            const item = sale.items.find(i => i.medicine_id === medicine_id && !i.is_refunded);
            if (!item) throw new BadRequestException('No unrefunded item found for this medicine in this sale');
            
            // For now, we assume full item refund as per current UI logic
            if (item.quantity < quantity) throw new BadRequestException('Refund quantity exceeds original sale item quantity');

            // 1. Create Refund Record
            const refund = manager.create(Refund, {
                sale_id,
                medicine_id,
                quantity,
                amount,
                reason,
                processed_by_id: userId
            });
            const savedRefund = await manager.save(refund);

            // 2. Update SaleItem status
            item.is_refunded = true;
            await manager.save(item);

            // 3. Update Sale Header
            // Check if ALL items are now refunded
            const allItemsRefunded = sale.items.every(i => i.is_refunded);
            sale.is_refunded = allItemsRefunded;
            sale.refund_amount = Number(sale.refund_amount || 0) + Number(amount);
            await manager.save(sale);

            // 4. Reverse Stock (Add back to batch)
            const TransactionType = (await import('../stock/entities/stock-transaction.entity')).TransactionType;
            await this.stockService.recordTransaction(
                item.batch_id,
                TransactionType.IN,
                quantity,
                ReferenceType.SALE,
                sale_id,
                userId
            );

            return savedRefund;
        });
    }
}
