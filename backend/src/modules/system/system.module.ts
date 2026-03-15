import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { Sale } from '../sales/entities/sale.entity';
import { Batch } from '../batches/entities/batch.entity';
import { GoodsReceipt } from '../purchase-orders/entities/goods-receipt.entity';

@Module({
    controllers: [SystemController],
    providers: [SystemService],
    exports: [SystemService],
})
export class SystemModule { }
