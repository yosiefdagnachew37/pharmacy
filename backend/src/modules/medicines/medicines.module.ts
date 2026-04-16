import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { AuditModule } from '../audit/audit.module';
import { Batch } from '../batches/entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, Batch]), AuditModule],
  controllers: [MedicinesController],
  providers: [MedicinesService],
  exports: [MedicinesService],
})
export class MedicinesModule { }
