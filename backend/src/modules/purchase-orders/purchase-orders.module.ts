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

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PurchaseOrder,
            PurchaseOrderItem,
            GoodsReceipt,
            Batch,
            StockTransaction,
            Medicine,
        ]),
        ForecastingModule,
    ],
    controllers: [PurchaseOrdersController],
    providers: [PurchaseOrdersService],
    exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule { }
