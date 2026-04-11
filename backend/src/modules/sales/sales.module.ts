import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Refund } from './entities/refund.entity';
import { SaleOrder } from './entities/sale-order.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { StockModule } from '../stock/stock.module';
import { AlertsModule } from '../alerts/alerts.module';
import { AuditModule } from '../audit/audit.module';
import { CreditModule } from '../credit/credit.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Sale, SaleItem, Refund, SaleOrder]),
        StockModule,
        AlertsModule,
        AuditModule,
        NotificationsModule,
        CreditModule,
    ],
    controllers: [SalesController],
    providers: [SalesService],
    exports: [SalesService],
})
export class SalesModule { }
