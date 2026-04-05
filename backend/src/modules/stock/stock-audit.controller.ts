import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { StockAuditService } from './stock-audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('stock-audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockAuditController {
    constructor(private readonly auditService: StockAuditService) { }

    @Post('sessions')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    createSession(@Request() req, @Body('name') name: string, @Body('notes') notes: string) {
        return this.auditService.createSession(req.user.userId, name, notes);
    }

    @Get('sessions')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    getSessions() {
        return this.auditService.getSessions();
    }

    @Get('sessions/:id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    getSessionDetails(@Param('id') id: string) {
        return this.auditService.getSessionDetails(id);
    }

    @Patch('sessions/:id/items/:batchId')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    updateScannedQuantity(
        @Param('id') id: string,
        @Param('batchId') batchId: string,
        @Body('quantity') quantity: number
    ) {
        return this.auditService.updateScannedQuantity(id, batchId, quantity);
    }

    @Post('sessions/:id/finalize')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    finalizeAudit(@Param('id') id: string) {
        return this.auditService.finalizeAudit(id);
    }
}
