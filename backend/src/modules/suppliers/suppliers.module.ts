import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierContract } from './entities/supplier-contract.entity';
import { SupplierPerformance } from './entities/supplier-performance.entity';
import { PriceHistory } from './entities/price-history.entity';
import { SupplierPayment } from './entities/supplier-payment.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Supplier,
            SupplierContract,
            SupplierPerformance,
            PriceHistory,
            SupplierPayment,
            PurchaseOrder,
        ]),
    ],
    controllers: [SuppliersController],
    providers: [SuppliersService],
    exports: [SuppliersService],
})
export class SuppliersModule { }
