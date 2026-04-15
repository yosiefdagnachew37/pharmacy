import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentAccountsService } from './payment-accounts.service';
import { PaymentAccountsController } from './payment-accounts.controller';
import { PaymentAccount } from './entities/payment-account.entity';
import { PaymentAccountTransaction } from './entities/payment-account-transaction.entity';
import { TransferRequest } from './entities/transfer-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentAccount, PaymentAccountTransaction, TransferRequest])],
  providers: [PaymentAccountsService],
  controllers: [PaymentAccountsController],
  exports: [PaymentAccountsService],
})
export class PaymentAccountsModule {}
