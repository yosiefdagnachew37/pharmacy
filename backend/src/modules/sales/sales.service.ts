import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, PaymentMethod } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { StockService } from '../stock/stock.service';
import { ReferenceType } from '../stock/entities/stock-transaction.entity';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(Sale)
        private readonly salesRepository: Repository<Sale>,
        @InjectRepository(SaleItem)
        private readonly itemsRepository: Repository<SaleItem>,
        private stockService: StockService,
        private dataSource: DataSource,
    ) { }

    async create(createSaleDto: CreateSaleDto, userId: string): Promise<Sale> {
        const { items, total_price, payment_method, ...rest } = createSaleDto;

        return await this.dataSource.transaction(async (manager) => {
            // 1. Create Sale Header
            const sale = manager.create(Sale, {
                ...rest,
                total_amount: total_price,
                payment_method: (payment_method as PaymentMethod) || PaymentMethod.CASH,
                created_by: userId,
            });
            const savedSale = await manager.save(sale);

            // 2. Process Items and Reduce Stock
            for (const item of items) {
                // Issue stock using FIFO logic
                await this.stockService.issueStock(
                    item.medicine_id,
                    item.quantity,
                    ReferenceType.SALE,
                    savedSale.id,
                    userId
                );

                // Create SaleItem record
                const saleItem = manager.create(SaleItem, {
                    medicine_id: item.medicine_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    sale_id: savedSale.id,
                });
                await manager.save(saleItem);
            }

            const finalSale = await manager.findOne(Sale, {
                where: { id: savedSale.id },
                relations: ['items', 'items.medicine', 'patient'],
            });

            if (!finalSale) throw new Error('Sale creation failed');
            return finalSale;
        });
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
