import { Controller, Get, Post, Param, UseGuards, Body, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';

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

    // ─── Download a specific backup file to client browser ─────
    @Get('backups/:filename/download')
    @Roles(UserRole.SUPER_ADMIN)
    async downloadBackup(
        @Param('filename') filename: string,
        @Res() res: Response,
    ) {
        const filePath = this.systemService.getBackupFilePath(filename);
        res.download(filePath, filename);
    }

    // ─── Restore from an uploaded .sql file ────────────────────
    @Post('restore/upload')
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
    async restoreFromUpload(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        return this.systemService.restoreFromUpload(file.buffer, file.originalname);
    }

    // ─── Restore from an internally stored backup ──────────────
    @Post('restore/:filename')
    @Roles(UserRole.SUPER_ADMIN)
    restoreBackup(@Param('filename') filename: string) {
        return this.systemService.restoreBackup(filename);
    }

    @Post('generate-license')
    @Roles(UserRole.SUPER_ADMIN)
    generateLicense(@Body() body: { hwid: string, expiry?: string, plan?: string }) {
        return this.systemService.generateLicense(body.hwid, body.expiry, body.plan);
    }
}
