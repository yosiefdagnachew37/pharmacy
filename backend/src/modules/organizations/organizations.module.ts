import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController, MyOrganizationController, AdminBillingController } from './organizations.controller';
import { Organization } from './entities/organization.entity';
import { UsersModule } from '../users/users.module';
import { SubscriptionPlansModule } from '../subscription-plans/subscription-plans.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionPlan } from '../subscription-plans/entities/subscription-plan.entity';
import { SubscriptionRequest } from '../subscription-plans/entities/subscription-request.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Organization, SubscriptionPlan, SubscriptionRequest]),
        UsersModule,
        SubscriptionPlansModule,
        NotificationsModule,
    ],
    controllers: [OrganizationsController, MyOrganizationController, AdminBillingController],
    providers: [OrganizationsService],
    exports: [OrganizationsService],
})
export class OrganizationsModule { }
 Riverside:4;18-20
