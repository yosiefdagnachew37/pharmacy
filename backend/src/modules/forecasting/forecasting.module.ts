import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ForecastingController } from './forecasting.controller';
import { ForecastingService } from './forecasting.service';
import { Medicine } from '../medicines/entities/medicine.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { ForecastResult } from './entities/forecast-result.entity';
import { PurchaseRecommendation } from './entities/purchase-recommendation.entity';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { Sale } from '../sales/entities/sale.entity';
import { NotificationsModule } from '../notifications/notifications.module'; // Assuming this path for NotificationsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ForecastResult,
      PurchaseRecommendation,
      Medicine,
      Sale
    ]),
    NotificationsModule,
  ],
  controllers: [ForecastingController],
  providers: [ForecastingService, AnomalyDetectionService],
  exports: [ForecastingService, AnomalyDetectionService],
})
export class ForecastingModule { }
