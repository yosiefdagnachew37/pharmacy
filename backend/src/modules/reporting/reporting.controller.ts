import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Response } from 'express';

@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('dashboard')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    getDashboardStats() {
        return this.reportingService.getDashboardStats();
    }

    @Get('sales')
    @Roles(UserRole.ADMIN)
    async getSalesReport(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = end ? new Date(end) : new Date();
        return this.reportingService.getSalesReport(startDate, endDate);
    }

    @Get('sales/export/excel')
    @Roles(UserRole.ADMIN)
    async exportSalesExcel(
        @Query('start') start: string,
        @Query('end') end: string,
        @Res() res: Response,
    ) {
        const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = end ? new Date(end) : new Date();

        const workbook = await this.reportingService.generateSalesExcel(startDate, endDate);

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + `sales_report_${startDate.toISOString().split('T')[0]}.xlsx`,
        );

        await workbook.xlsx.write(res);
        res.end();
    }

    @Get('sales/export/pdf')
    @Roles(UserRole.ADMIN)
    async exportSalesPdf(
        @Query('start') start: string,
        @Query('end') end: string,
        @Res() res: Response,
    ) {
        const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = end ? new Date(end) : new Date();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + `sales_report_${startDate.toISOString().split('T')[0]}.pdf`,
        );

        this.reportingService.generateSalesPdf(startDate, endDate, res);
    }

    @Get('stock-movement')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async getStockMovement(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = end ? new Date(end) : new Date();
        return this.reportingService.getStockMovementReport(startDate, endDate);
    }

    @Get('expiry')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async getExpiryReport(@Query('days') days: string) {
        return this.reportingService.getExpiryReport(parseInt(days, 10) || 30);
    }
}
