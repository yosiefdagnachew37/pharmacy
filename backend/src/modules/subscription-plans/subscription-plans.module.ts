import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlansService } from './subscription-plans.service';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SystemFeature } from './entities/system-feature.entity';
import { SubscriptionRequest } from './entities/subscription-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan, SystemFeature, SubscriptionRequest])],
  controllers: [SubscriptionPlansController],
  providers: [SubscriptionPlansService],
  exports: [SubscriptionPlansService, TypeOrmModule]
})
export class SubscriptionPlansModule {}
