import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
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
