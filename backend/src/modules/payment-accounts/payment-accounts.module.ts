import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentAccount } from './entities/payment-account.entity';
import { PaymentAccountsService } from './payment-accounts.service';
import { PaymentAccountsController } from './payment-accounts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentAccount])],
  providers: [PaymentAccountsService],
  controllers: [PaymentAccountsController],
  exports: [PaymentAccountsService],
})
export class PaymentAccountsModule {}
