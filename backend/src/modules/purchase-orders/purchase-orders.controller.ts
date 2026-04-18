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

    @Get('pending-payment')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    findPendingPayment() {
        return this.poService.findPendingPayment();
    }

    @Get('summary')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    getSummary() {
        return this.poService.getSummary();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    findOne(@Param('id') id: string) {
        return this.poService.findOne(id);
    }

    @Get(':id/items')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    getItems(@Param('id') id: string) {
        return this.poService.getItems(id);
    }

    @Get(':id/receipts')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    getReceipts(@Param('id') id: string) {
        return this.poService.getReceipts(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() body: any, @Request() req: any) {
        return this.poService.create(body, req.user.userId);
    }

    @Post('register')
    @Roles(UserRole.ADMIN)
    register(@Body() body: any, @Request() req: any) {
        return this.poService.registerPurchase(body, req.user.userId);
    }

    @Put(':id/status')
    @Roles(UserRole.ADMIN)
    updateStatus(@Param('id') id: string, @Body() body: { status: POStatus }, @Request() req: any) {
        return this.poService.updateStatus(id, body.status, req.user.userId);
    }

    @Post(':id/pay')
    @Roles(UserRole.ADMIN)
    recordPayment(@Param('id') id: string, @Body() body: { payment_account_id: string; amount: number }, @Request() req: any) {
        return this.poService.recordPayment(id, body, req.user.userId);
    }
}
