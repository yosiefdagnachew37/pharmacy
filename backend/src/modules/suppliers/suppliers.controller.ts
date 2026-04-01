import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { RequireFeature } from '../../common/decorators/feature.decorator';
import { FeatureGuard } from '../../common/guards/feature.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard)
@RequireFeature('Suppliers')
export class SuppliersController {
    constructor(private readonly suppliersService: SuppliersService) { }

    // ─── Supplier CRUD ─────────────────────────────────
    @Get()
    findAll() {
        return this.suppliersService.findAll();
    }

    @Get('ranking')
    getRanking(@Query('limit') limit?: string) {
        return this.suppliersService.getSupplierRanking(limit ? parseInt(limit) : 5);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.suppliersService.findOne(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() body: any) {
        return this.suppliersService.create(body);
    }

    @Put(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() body: any) {
        return this.suppliersService.update(id, body);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.suppliersService.remove(id);
    }

    // ─── Contracts ─────────────────────────────────────
    @Get(':id/contracts')
    getContracts(@Param('id') id: string) {
        return this.suppliersService.getContracts(id);
    }

    @Post(':id/contracts')
    @Roles(UserRole.ADMIN)
    createContract(@Param('id') id: string, @Body() body: any) {
        return this.suppliersService.createContract(id, body);
    }

    @Delete('contracts/:contractId')
    @Roles(UserRole.ADMIN)
    deleteContract(@Param('contractId') contractId: string) {
        return this.suppliersService.deleteContract(contractId);
    }

    // ─── Performance ───────────────────────────────────
    @Get(':id/performance')
    getPerformance(@Param('id') id: string) {
        return this.suppliersService.getPerformance(id);
    }

    @Post(':id/performance')
    @Roles(UserRole.ADMIN)
    recordPerformance(@Param('id') id: string, @Body() body: any) {
        return this.suppliersService.recordPerformance(id, body);
    }

    // ─── Price History ─────────────────────────────────
    @Get('price-history/:medicineId')
    getPriceHistory(
        @Param('medicineId') medicineId: string,
        @Query('supplierId') supplierId?: string,
    ) {
        return this.suppliersService.getPriceHistory(medicineId, supplierId);
    }

    @Post('price-history')
    @Roles(UserRole.ADMIN)
    recordPrice(@Body() body: { medicineId: string; supplierId: string; unitPrice: number }) {
        return this.suppliersService.recordPrice(body.medicineId, body.supplierId, body.unitPrice);
    }

    // ─── Payments ──────────────────────────────────────
    @Get('payments')
    getPayments(
        @Query('supplierId') supplierId?: string,
        @Query('poId') poId?: string,
    ) {
        return this.suppliersService.getPayments(supplierId, poId);
    }

    @Post('payments')
    @Roles(UserRole.ADMIN)
    recordPayment(@Request() req, @Body() body: any) {
        return this.suppliersService.recordPayment({
            ...body,
            created_by: req.user.userId,
        });
    }
}
