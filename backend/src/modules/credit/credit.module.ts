import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CreditRecord } from './entities/credit-record.entity';
import { CreditPayment } from './entities/credit-payment.entity';
import { ChequeRecord } from './entities/cheque-record.entity';
import { CreditService } from './credit.service';
import { CreditController } from './credit.controller';
import { AlertCronService } from './alert-cron.service';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Patient } from '../patients/entities/patient.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer, CreditRecord, CreditPayment, PurchaseOrder, ChequeRecord, Patient]),
        NotificationsModule,
    ],
    controllers: [CreditController],
    providers: [CreditService, AlertCronService],
    exports: [CreditService, AlertCronService], // Exported because SalesService needs it for credit sales
})
export class CreditModule { }
