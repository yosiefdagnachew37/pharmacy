import { Module } from '@nestjs/common';
import { AuditModule } from './audit.module';
import { SalesModule } from './sales.module';

@Module({
  imports: [AuditModule, SalesModule]
})
export class AlertsModule {}
