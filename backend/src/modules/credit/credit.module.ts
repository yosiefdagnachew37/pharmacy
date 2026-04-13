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
import { OrganizationsModule } from '../organizations/organizations.module';
import { PaymentAccount } from '../payment-accounts/entities/payment-account.entity';
import { PaymentAccountTransaction } from '../payment-accounts/entities/payment-account-transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer, CreditRecord, CreditPayment, PurchaseOrder, ChequeRecord, Patient, PaymentAccount, PaymentAccountTransaction]),
        NotificationsModule,
        OrganizationsModule,
    ],
    controllers: [CreditController],
    providers: [CreditService, AlertCronService],
    exports: [CreditService, AlertCronService],
})
export class CreditModule { }
