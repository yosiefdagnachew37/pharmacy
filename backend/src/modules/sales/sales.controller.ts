import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { CreateSaleOrderDto, ConfirmSaleOrderDto } from './dto/create-sale-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
    constructor(
        private readonly salesService: SalesService,
        private readonly auditService: AuditService,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────────
    // SALE ORDER WORKFLOW
    // ─────────────────────────────────────────────────────────────────────────────

    /** Step 1: Pharmacist creates a pending order and sends it to the cashier queue */
    @Post('orders')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async createOrder(@Body() dto: CreateSaleOrderDto, @Request() req: any) {
        const order = await this.salesService.createOrder(dto, req.user.userId);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.CREATE,
            entity: 'sale_orders',
            entity_id: order.id,
            new_values: { order_number: order.order_number, total_amount: order.total_amount, items_count: order.items?.length },
        });
        return order;
    }

    /** Cashier queue: get all PENDING orders */
    @Get('orders/pending')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    findPendingOrders() {
        return this.salesService.findPendingOrders();
    }

    /** Pharmacist's own orders — used for polling confirmation status */
    @Get('orders/mine')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    findMyOrders(@Request() req: any) {
        return this.salesService.findMyOrders(req.user.userId);
    }

    /** Step 2: Cashier confirms the order, selects payment account, stock deducted */
    @Post('orders/:id/confirm')
    @Roles(UserRole.ADMIN, UserRole.CASHIER)
    async confirmOrder(
        @Param('id') id: string,
        @Body() dto: ConfirmSaleOrderDto,
        @Request() req: any,
    ) {
        const sale = await this.salesService.confirmOrder(id, dto, req.user.userId);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.SELL,
            entity: 'sales',
            entity_id: sale.id,
            new_values: { total_amount: sale.total_amount, payment_account: dto.payment_account_name },
            is_controlled_transaction: sale.is_controlled_transaction,
        });
        return sale;
    }

    /** Cancel a pending order */
    @Post('orders/:id/cancel')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    async cancelOrder(@Param('id') id: string, @Request() req: any) {
        return this.salesService.cancelOrder(id, req.user.userId);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // DIRECT SALE (Admin / legacy path)
    // ─────────────────────────────────────────────────────────────────────────────

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    async create(@Body() createSaleDto: CreateSaleDto, @Request() req: any) {
        const result = await this.salesService.create(createSaleDto, req.user.userId);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.SELL,
            entity: 'sales',
            entity_id: result.id,
            new_values: { total_amount: result.total_amount, items_count: result.items?.length },
            is_controlled_transaction: result.is_controlled_transaction,
        });
        return result;
    }

    @Get()
    findAll() {
        return this.salesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }

    @Post(':id/refund')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async refund(
        @Param('id') id: string,
        @Body() createRefundDto: CreateRefundDto,
        @Request() req: any
    ) {
        const result = await this.salesService.processRefund({ ...createRefundDto, sale_id: id }, req.user.userId);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.REFUND,
            entity: 'sales',
            entity_id: id,
            new_values: { amount: createRefundDto.amount, medicine_id: createRefundDto.medicine_id },
        });
        return result;
    }
}
