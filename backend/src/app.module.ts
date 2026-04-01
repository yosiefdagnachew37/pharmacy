import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './modules/users/entities/user.entity';
import { Organization } from './modules/organizations/entities/organization.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { TenantSubscriber } from './common/subscribers/tenant.subscriber';
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
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { SubscriptionPlansModule } from './modules/subscription-plans/subscription-plans.module';

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
        subscribers: [TenantSubscriber],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Organization]),
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
    OrganizationsModule,
    SubscriptionPlansModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },
  ],
})
export class AppModule { }
