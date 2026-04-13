import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { POStatus } from './entities/purchase-order.entity';
import { RequireFeature } from '../../common/decorators/feature.decorator';
import { FeatureGuard } from '../../common/guards/feature.guard';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard)
@RequireFeature('Purchases')
export class PurchaseOrdersController {
    constructor(private readonly poService: PurchaseOrdersService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    findAll(@Query('status') status?: POStatus) {
        return this.poService.findAll(status);
    }

    @Get('summary')
    getSummary() {
        return this.poService.getSummary();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.poService.findOne(id);
    }

    @Get(':id/items')
    getItems(@Param('id') id: string) {
        return this.poService.getItems(id);
    }

    @Get(':id/receipts')
    getReceipts(@Param('id') id: string) {
        return this.poService.getReceipts(id);
    }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    create(@Body() body: any, @Request() req: any) {
        return this.poService.create(body, req.user.userId);
    }

    @Put(':id/status')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    updateStatus(@Param('id') id: string, @Body() body: { status: POStatus }, @Request() req: any) {
        return this.poService.updateStatus(id, body.status, req.user.userId);
    }

    @Get('pending-payment')
    @Roles(UserRole.ADMIN, UserRole.CASHIER)
    findPendingPayment() {
        return this.poService.findPendingPayment();
    }

    @Post(':id/pay')
    @Roles(UserRole.ADMIN, UserRole.CASHIER)
    recordPayment(@Param('id') id: string, @Body() body: { payment_account_id: string; amount: number }, @Request() req: any) {
        return this.poService.recordPayment(id, body, req.user.userId);
    }

    @Post(':id/receive')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    receiveGoods(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.poService.receiveGoods(id, body.items, req.user.userId, body.notes);
    }
}
