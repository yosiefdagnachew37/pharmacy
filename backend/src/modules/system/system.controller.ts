import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('system')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SystemController {
    constructor(private readonly systemService: SystemService) { }

    @Get('status')
    getSystemStatus() {
        return this.systemService.getSystemStatus();
    }

    @Post('backup')
    createBackup() {
        return this.systemService.createBackup();
    }

    @Get('backups')
    listBackups() {
        return this.systemService.listBackups();
    }

    @Post('restore/:filename')
    restoreBackup(@Param('filename') filename: string) {
        return this.systemService.restoreBackup(filename);
    }
}
