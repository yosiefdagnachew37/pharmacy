import { Controller, Get, Post, Param, Patch, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) { }

    @Get()
    findAll() {
        return this.alertsService.findAll();
    }

    @Get('active')
    findActive() {
        return this.alertsService.findActive();
    }

    @Patch(':id/resolve')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    resolve(@Param('id') id: string) {
        return this.alertsService.resolve(id);
    }

    @Post('trigger-check')
    @Roles(UserRole.ADMIN)
    async triggerCheck() {
        await this.alertsService.checkLowStock();
        await this.alertsService.checkExpiringMedicines();
        return { message: 'Alert check triggered successfully' };
    }
}
