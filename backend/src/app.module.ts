import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MedicinesModule } from './modules/medicines/medicines.module';
import { BatchesModule } from './modules/batches/batches.module';
import { StockModule } from './modules/stock/stock.module';
import { PatientsModule } from './modules/patients/patients.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AuditModule } from './modules/audit/audit.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { SalesModule } from './modules/sales/sales.module';
import { SystemModule } from './modules/system/system.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { CreditModule } from './modules/credit/credit.module';
import { ForecastingModule } from './modules/forecasting/forecasting.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { BranchesModule } from './modules/branches/branches.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    MedicinesModule,
    BatchesModule,
    StockModule,
    PatientsModule,
    PrescriptionsModule,
    AlertsModule,
    AuditModule,
    SalesModule,
    ReportingModule,
    SystemModule,
    NotificationsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    ExpensesModule,
    CreditModule,
    ForecastingModule,
    ReceiptsModule,
    BranchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
