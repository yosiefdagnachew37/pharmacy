import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.SUPER_ADMIN)
    findAll() {
        return this.auditService.findAll();
    }

    @Get('user/:userId')
    @Roles(UserRole.ADMIN, UserRole.AUDITOR, UserRole.SUPER_ADMIN)
    findByUser(@Param('userId') userId: string) {
        return this.auditService.findByUser(userId);
    }
}
