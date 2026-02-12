import { Module } from '@nestjs/common';
import { BatchesModule } from './batches.module';

@Module({
  imports: [BatchesModule]
})
export class MedicinesModule {}
