import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ForecastingService } from './forecasting.service';
import { RecommendationStatus } from './entities/purchase-recommendation.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { RequireFeature } from '../../common/decorators/feature.decorator';
import { FeatureGuard } from '../../common/guards/feature.guard';

@Controller('forecasting')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard)
@RequireFeature('Intelligent Forecasting')
export class ForecastingController {
    constructor(private readonly forecastingService: ForecastingService) { }

    @Get('recommendations')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async getRecommendations() {
        return this.forecastingService.getRecommendations();
    }

    @Put('recommendations/:id/status')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async updateRecommendationStatus(
        @Param('id') id: string,
        @Body() body: { status: RecommendationStatus, reason?: string }
    ) {
        return this.forecastingService.updateRecommendationStatus(id, body.status, body.reason);
    }

    @Get('dead-stock')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async getDeadStock() {
        return this.forecastingService.getDeadStock();
    }

    @Post('trigger-manual')
    @Roles(UserRole.ADMIN)
    async triggerManualForecast() {
        // Run the cron job manually in the background
        this.forecastingService.generateDailyForecasts();
        return { message: 'Forecast generation started in the background.' };
    }
}

