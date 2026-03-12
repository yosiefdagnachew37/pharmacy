import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptsService } from './receipts.service';
import { ReceiptsController } from './receipts.controller';
import { Sale } from '../sales/entities/sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale])],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule { }
