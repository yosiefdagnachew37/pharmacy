import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { Batch } from '../batches/entities/batch.entity';
import { StockTransaction } from '../stock/entities/stock-transaction.entity';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { Medicine } from '../medicines/entities/medicine.entity';
import { ForecastingModule } from '../forecasting/forecasting.module';
import { StockModule } from '../stock/stock.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { PaymentAccount } from '../payment-accounts/entities/payment-account.entity';
import { PaymentAccountTransaction } from '../payment-accounts/entities/payment-account-transaction.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PurchaseOrder,
            PurchaseOrderItem,
            GoodsReceipt,
            Batch,
            StockTransaction,
            Medicine,
            PaymentAccount,
            PaymentAccountTransaction,
        ]),
        ForecastingModule,
        StockModule,
        OrganizationsModule,
        SuppliersModule,
        NotificationsModule,
    ],
    controllers: [PurchaseOrdersController],
    providers: [PurchaseOrdersService],
    exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule { }
