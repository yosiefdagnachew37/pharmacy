import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { StockService } from './stock.service';
import { ExpiryIntelligenceService } from './expiry-intelligence.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ReferenceType } from './entities/stock-transaction.entity';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
    constructor(
        private readonly stockService: StockService,
        private readonly expiryIntelligenceService: ExpiryIntelligenceService,
    ) { }

    @Get('history')
    getTransactionHistory(@Query('batchId') batchId?: string) {
        return this.stockService.getTransactionHistory(batchId);
    }

    @Get('medicine/:id')
    getMedicineStock(@Param('id') id: string) {
        return this.stockService.getMedicineStock(id);
    }

    // Manual adjustment (Admin only)
    @Post('adjust')
    @Roles(UserRole.ADMIN)
    async adjustStock(@Body() body: any, @Request() req: any) {
        const { batchId, type, quantity, reason } = body;
        return this.stockService.recordTransaction(
            batchId,
            type,
            quantity,
            ReferenceType.ADJUSTMENT,
            reason || 'Manual Adjustment',
            req.user.userId
        );
    }

    // FEFO Override: Issue from a specific batch (Admin/Pharmacist only)
    @Post('override')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async fefoOverride(@Body() body: any, @Request() req: any) {
        const { batchId, quantity, referenceType, referenceId, reason } = body;
        return this.stockService.issueStockWithOverride(
            batchId,
            quantity,
            referenceType || ReferenceType.SALE,
            referenceId || 'MANUAL_OVERRIDE',
            req.user.userId,
            reason,
        );
    }

    // Expiry Intelligence: Risk scoring
    @Get('expiry-risk')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    getExpiryRisk() {
        return this.expiryIntelligenceService.calculateExpiryRisk();
    }

    // Expiry Intelligence: Dashboard data
    @Get('expiry-dashboard')
    getExpiryDashboard() {
        return this.expiryIntelligenceService.getExpiryDashboardData();
    }

    // FEFO Compliance Report
    @Get('fefo-compliance')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    getFefoCompliance(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.expiryIntelligenceService.getFefoComplianceReport(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }
}

