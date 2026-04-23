import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Batch } from './entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Batch, Medicine, Supplier]), AuditModule],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule { }
