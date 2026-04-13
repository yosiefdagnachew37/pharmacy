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
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER, UserRole.AUDITOR)
    getDashboardStats() {
        return this.reportingService.getDashboardStats();
    }

    // ─── DATA ENDPOINTS ──────────────────────────────────────────

    @Get('sales')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async getSalesReport(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = end ? new Date(end) : new Date();
        return this.reportingService.getSalesReport(startDate, endDate);
    }

    @Get('purchases')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER, UserRole.AUDITOR)
    async getPurchasesReport(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = end ? new Date(end) : new Date();
        return this.reportingService.getPurchasesReport(startDate, endDate);
    }

    @Get('profit-loss')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR)
    async getProfitLoss(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = end ? new Date(end) : new Date();
        return this.reportingService.getProfitLossReport(startDate, endDate);
    }

    @Get('daily-profit-analytics')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR)
    async getDailyProfitAnalytics(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 7));
        const endDate = end ? new Date(end) : new Date();
        return this.reportingService.getDailyProfitAnalytics(startDate, endDate);
    }

    @Get('medicines')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async getMedicineReport() {
        return this.reportingService.getMedicineReport();
    }

    @Get('batches-status')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async getBatchReport() {
        return this.reportingService.getBatchReport();
    }

    // ─── DASHBOARD TRENDS ────────────────────────────────────────

    @Get('trending-medicines')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER, UserRole.AUDITOR)
    async getTrendingMedicines(@Query('limit') limit: string) {
        return this.reportingService.getTrendingMedicines(parseInt(limit, 10) || 10);
    }

    @Get('least-selling')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async getLeastSellingMedicines(@Query('limit') limit: string) {
        return this.reportingService.getLeastSellingMedicines(parseInt(limit, 10) || 10);
    }

    @Get('sales-trend')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async getSalesTrend(@Query('days') days: string) {
        return this.reportingService.getSalesTrend(parseInt(days, 10) || 30);
    }

    @Get('revenue-comparison')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async getRevenueComparison() {
        return this.reportingService.getRevenueComparison();
    }

    // ─── EXPORT ENDPOINTS ────────────────────────────────────────

    // Sales Exports
    @Get('sales/export/excel')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async exportSalesExcel(@Query('start') start: string, @Query('end') end: string, @Res() res: Response) {
        const { startDate, endDate } = this.parseDates(start, end);
        const workbook = await this.reportingService.generateSalesExcel(startDate, endDate);
        this.sendExcelResponse(res, workbook, `sales_report_${startDate.toISOString().split('T')[0]}.xlsx`);
    }

    @Get('sales/export/pdf')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async exportSalesPdf(@Query('start') start: string, @Query('end') end: string, @Res() res: Response) {
        const { startDate, endDate } = this.parseDates(start, end);
        this.sendPdfHeaders(res, `sales_report_${startDate.toISOString().split('T')[0]}.pdf`);
        this.reportingService.generateSalesPdf(startDate, endDate, res);
    }

    @Get('sales/export/word')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async exportSalesWord(@Query('start') start: string, @Query('end') end: string, @Res() res: Response) {
        const { startDate, endDate } = this.parseDates(start, end);
        const buffer = await this.reportingService.generateSalesWord(startDate, endDate);
        this.sendWordResponse(res, buffer, `sales_report_${startDate.toISOString().split('T')[0]}.docx`);
    }

    // Profit & Loss Exports
    @Get('profit-loss/export/excel')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR)
    async exportPLExcel(@Query('start') start: string, @Query('end') end: string, @Res() res: Response) {
        const { startDate, endDate } = this.parseDates(start, end);
        const workbook = await this.reportingService.generateProfitLossExcel(startDate, endDate);
        this.sendExcelResponse(res, workbook, `profit_loss_${startDate.toISOString().split('T')[0]}.xlsx`);
    }

    @Get('profit-loss/export/pdf')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR)
    async exportPLPdf(@Query('start') start: string, @Query('end') end: string, @Res() res: Response) {
        const { startDate, endDate } = this.parseDates(start, end);
        this.sendPdfHeaders(res, `profit_loss_${startDate.toISOString().split('T')[0]}.pdf`);
        this.reportingService.generateProfitLossPdf(startDate, endDate, res);
    }

    @Get('profit-loss/export/word')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR)
    async exportPLWord(@Query('start') start: string, @Query('end') end: string, @Res() res: Response) {
        const { startDate, endDate } = this.parseDates(start, end);
        const buffer = await this.reportingService.generateProfitLossWord(startDate, endDate);
        this.sendWordResponse(res, buffer, `profit_loss_${startDate.toISOString().split('T')[0]}.docx`);
    }

    // Medicines Exports
    @Get('medicines/export/excel')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async exportMedsExcel(@Res() res: Response) {
        const workbook = await this.reportingService.generateMedicineExcel();
        this.sendExcelResponse(res, workbook, `medicines_inventory.xlsx`);
    }

    @Get('medicines/export/pdf')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async exportMedsPdf(@Res() res: Response) {
        this.sendPdfHeaders(res, `medicines_inventory.pdf`);
        this.reportingService.generateMedicinePdf(res);
    }

    @Get('medicines/export/word')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async exportMedsWord(@Res() res: Response) {
        const buffer = await this.reportingService.generateMedicineWord();
        this.sendWordResponse(res, buffer, `medicines_inventory.docx`);
    }

    // Batches Exports
    @Get('batches/export/excel')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async exportBatchesExcel(@Res() res: Response) {
        const workbook = await this.reportingService.generateBatchExcel();
        this.sendExcelResponse(res, workbook, `batches_status.xlsx`);
    }

    @Get('batches/export/pdf')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async exportBatchesPdf(@Res() res: Response) {
        this.sendPdfHeaders(res, `batches_status.pdf`);
        this.reportingService.generateBatchPdf(res);
    }

    @Get('batches/export/word')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async exportBatchesWord(@Res() res: Response) {
        const buffer = await this.reportingService.generateBatchWord();
        this.sendWordResponse(res, buffer, `batches_status.docx`);
    }

    @Get('stock-movement')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async getStockMovement(@Query('start') start: string, @Query('end') end: string) {
        const { startDate, endDate } = this.parseDates(start, end);
        return this.reportingService.getStockMovementReport(startDate, endDate);
    }

    @Get('expiry')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async getExpiryReport(@Query('days') days: string) {
        return this.reportingService.getExpiryReport(parseInt(days, 10) || 30);
    }

    @Get('regulatory-narcotics')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    async getRegulatoryNarcotics(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const { startDate, endDate } = this.parseDates(start, end);
        return this.reportingService.getRegulatoryNarcoticsReport(startDate, endDate);
    }

    @Get('fefo-compliance')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR)
    async getFEFOCompliance(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const { startDate, endDate } = this.parseDates(start, end);
        return this.reportingService.getFEFOComplianceReport(startDate, endDate);
    }

    @Get('expiry-loss')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async getExpiryLoss() {
        return this.reportingService.getExpiryLossReport();
    }

    @Get('batch-turnover')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async getBatchTurnover() {
        return this.reportingService.getBatchTurnoverReport();
    }

    @Get('profit-margin')
    @Roles(UserRole.ADMIN)
    async getProfitMargin() {
        return this.reportingService.getProfitMarginAnalysis();
    }

    @Get('pareto-analysis')
    @Roles(UserRole.ADMIN)
    async getParetoAnalysis(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const { startDate, endDate } = this.parseDates(start, end);
        return this.reportingService.getParetoAnalysis(startDate, endDate);
    }

    @Get('inventory-turnover')
    @Roles(UserRole.ADMIN)
    async getInventoryTurnover(
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const { startDate, endDate } = this.parseDates(start, end);
        return this.reportingService.getInventoryTurnoverRatio(startDate, endDate);
    }

    @Get('expense-trend')
    @Roles(UserRole.ADMIN)
    async getExpenseTrend() {
        return this.reportingService.getExpenseTrendReport();
    }

    @Get('working-capital')
    @Roles(UserRole.ADMIN)
    async getWorkingCapital() {
        return this.reportingService.getWorkingCapital();
    }

    @Get('expected-daily-expense')
    @Roles(UserRole.ADMIN)
    async getExpectedDailyExpense() {
        return this.reportingService.getDailyExpenseSummary();
    }

    @Get('supplier-payment-aging')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR)
    async getSupplierPaymentAging() {
        return this.reportingService.getSupplierPaymentAging();
    }

    // ─── HELPERS ────────────────────────────────────────────────

    private parseDates(start: string, end: string) {
        const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = end ? new Date(end) : new Date();
        return { startDate, endDate };
    }

    private sendExcelResponse(res: Response, workbook: any, filename: string) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        workbook.xlsx.write(res).then(() => res.end());
    }

    private sendPdfHeaders(res: Response, filename: string) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    }

    private sendWordResponse(res: Response, buffer: Buffer, filename: string) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(buffer);
    }
}
