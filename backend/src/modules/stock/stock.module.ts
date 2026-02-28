import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockTransaction } from './entities/stock-transaction.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([StockTransaction, Batch, Medicine])
    ],
    controllers: [StockController],
    providers: [StockService],
    exports: [StockService],
})
export class StockModule { }
