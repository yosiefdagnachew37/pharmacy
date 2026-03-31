import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('system')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemController {
    constructor(private readonly systemService: SystemService) { }

    // ─── ADMIN-accessible: read-only system status ─────────────
    @Get('status')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    getSystemStatus() {
        return this.systemService.getSystemStatus();
    }

    // ─── SUPER_ADMIN-only: all backup/restore actions ──────────
    @Post('backup')
    @Roles(UserRole.SUPER_ADMIN)
    createBackup() {
        return this.systemService.createBackup();
    }

    @Get('backups')
    @Roles(UserRole.SUPER_ADMIN)
    listBackups() {
        return this.systemService.listBackups();
    }

    @Post('restore/:filename')
    @Roles(UserRole.SUPER_ADMIN)
    restoreBackup(@Param('filename') filename: string) {
        return this.systemService.restoreBackup(filename);
    }
}
