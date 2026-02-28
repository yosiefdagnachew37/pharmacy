import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { ReferenceType } from './entities/stock-transaction.entity';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
    constructor(private readonly stockService: StockService) { }

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
}
