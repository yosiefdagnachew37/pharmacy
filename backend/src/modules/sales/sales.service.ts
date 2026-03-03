import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, PaymentMethod } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { StockService } from '../stock/stock.service';
import { ReferenceType } from '../stock/entities/stock-transaction.entity';
import { AlertsService } from '../alerts/alerts.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private readonly salesRepository: Repository<Sale>,
        @InjectRepository(SaleItem)
        private readonly itemsRepository: Repository<SaleItem>,
        private readonly stockService: StockService,
        private readonly alertsService: AlertsService,
        private readonly notificationsService: NotificationsService,
        private dataSource: DataSource,
    ) { }

    async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
        const { items, total_price, payment_method, ...rest } = createSaleDto;

        const sale = await this.dataSource.transaction(async (manager) => {
            // 1. Create Sale Header
            const saleHeader = manager.create(Sale, {
                ...rest,
                total_amount: total_price,
                payment_method: (payment_method as PaymentMethod) || PaymentMethod.CASH,
                created_by: userId,
            });
            const savedSale = await manager.save(saleHeader);

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
    }

    async findAll(): Promise<Sale[]> {
        return await this.salesRepository.find({
            relations: ['items', 'items.medicine', 'patient', 'user'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Sale | null> {
        return await this.salesRepository.findOne({
            where: { id },
            relations: ['items', 'items.medicine', 'patient', 'user'],
        });
    }
}
