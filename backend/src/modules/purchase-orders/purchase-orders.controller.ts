import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { POStatus, POPaymentMethod } from './entities/purchase-order.entity';
import { RequireFeature } from '../../common/decorators/feature.decorator';
import { FeatureGuard } from '../../common/guards/feature.guard';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard)
@RequireFeature('Purchases')
export class PurchaseOrdersController {
    constructor(
        private readonly poService: PurchaseOrdersService,
        private readonly auditService: AuditService,
    ) { }

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
    async create(@Body() body: any, @Request() req: any) {
        const result = await this.poService.create(body, req.user.userId);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.PURCHASE,
            entity: 'purchase_orders',
            entity_id: result?.id || 'N/A',
            new_values: { items_count: body.items?.length, supplier: body.supplier_id },
            description: `New purchase order created with ${body.items?.length ?? '?'} item(s)`,
        });
        return result;
    }

    @Post('register')
    @Roles(UserRole.ADMIN)
    async register(@Body() body: any, @Request() req: any) {
        const result = await this.poService.registerPurchase(body, req.user.userId);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.PURCHASE,
            entity: 'purchase_orders',
            entity_id: result?.id || 'N/A',
            new_values: { total_amount: body.total_amount, supplier: body.supplier_id },
            description: `Direct purchase registered — ETB ${Number(body.total_amount || 0).toFixed(2)} from supplier, stock updated`,
        });
        return result;
    }

    @Put(':id/status')
    @Roles(UserRole.ADMIN)
    async updateStatus(@Param('id') id: string, @Body() body: { status: POStatus }, @Request() req: any) {
        const result = await this.poService.updateStatus(id, body.status, req.user.userId);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.UPDATE,
            entity: 'purchase_orders',
            entity_id: id,
            new_values: { status: body.status },
            description: `Purchase order #${id} status changed to "${body.status}"`,
        });
        return result;
    }

    @Post(':id/pay')
    @Roles(UserRole.ADMIN)
    async recordPayment(
        @Param('id') id: string, 
        @Body() body: { 
            payment_method: POPaymentMethod;
            payment_account_id?: string; 
            amount: number;
            cheque_bank_name?: string;
            cheque_number?: string;
            cheque_due_date?: string;
        }, 
        @Request() req: any
    ) {
        const result = await this.poService.recordPayment(id, body, req.user.userId);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.PAYMENT,
            entity: 'purchase_orders',
            entity_id: id,
            new_values: { amount: body.amount, payment_method: body.payment_method },
            description: `Payment of ETB ${Number(body.amount).toFixed(2)} recorded for purchase order #${id} via ${body.payment_method}`,
        });
        return result;
    }
}
