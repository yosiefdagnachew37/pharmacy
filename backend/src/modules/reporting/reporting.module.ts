import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockTransaction } from '../stock/entities/stock-transaction.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Customer } from '../credit/entities/customer.entity';
import { CreditRecord } from '../credit/entities/credit-record.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Sale,
            SaleItem,
            Batch,
            Medicine,
            StockTransaction,
            Alert,
            Expense,
            PurchaseOrder,
            Customer,
            CreditRecord,
        ]),
    ],
    providers: [ReportingService],
    controllers: [ReportingController],
})
export class ReportingModule { }
