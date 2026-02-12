import { Module } from '@nestjs/common';
import { StockModule } from './stock.module';
import { PatientsModule } from './patients.module';
import { PrescriptionsModule } from './prescriptions.module';
import { AlertsModule } from './alerts.module';

@Module({
  imports: [StockModule, PatientsModule, PrescriptionsModule, AlertsModule]
})
export class BatchesModule {}
