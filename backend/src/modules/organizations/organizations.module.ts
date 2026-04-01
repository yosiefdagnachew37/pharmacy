import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController, MyOrganizationController } from './organizations.controller';
import { Organization } from './entities/organization.entity';
import { UsersModule } from '../users/users.module';
import { SubscriptionPlansModule } from '../subscription-plans/subscription-plans.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Organization]),
        UsersModule,
        SubscriptionPlansModule,
    ],
    controllers: [OrganizationsController, MyOrganizationController],
    providers: [OrganizationsService],
    exports: [OrganizationsService],
})
export class OrganizationsModule { }
