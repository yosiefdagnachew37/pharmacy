import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Controller('batches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BatchesController {
    constructor(
        private readonly batchesService: BatchesService,
        private readonly auditService: AuditService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async create(@Body() createBatchDto: CreateBatchDto, @Request() req: any) {
        const result = await this.batchesService.create(createBatchDto);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.CREATE,
            entity: 'batches',
            entity_id: result.id,
            new_values: { batch_number: result.batch_number, medicine_id: result.medicine_id, initial_quantity: result.initial_quantity },
        });
        return result;
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    findAll() {
        return this.batchesService.findAll();
    }

    @Get('expiring')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    findExpiring(@Query('days') days: string) {
        return this.batchesService.findExpiring(parseInt(days, 10) || 90);
    }

    @Get('expired')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    findExpired() {
        return this.batchesService.findExpired();
    }

    @Get('medicine/:id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    findByMedicine(@Param('id') id: string) {
        return this.batchesService.findByMedicine(id);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    findOne(@Param('id') id: string) {
        return this.batchesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto, @Request() req: any) {
        const result = await this.batchesService.update(id, updateBatchDto);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.UPDATE,
            entity: 'batches',
            entity_id: id,
            new_values: updateBatchDto,
        });
        return result;
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: string, @Request() req: any) {
        const batch = await this.batchesService.findOne(id);
        await this.batchesService.remove(id);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.DELETE,
            entity: 'batches',
            entity_id: id,
            old_values: { batch_number: batch.batch_number },
        });
    }

    @Post('import')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    @UseInterceptors(FileInterceptor('file'))
    async importExcel(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            return { created: 0, errors: [{ row: 0, message: 'No file uploaded' }] };
        }
        return this.batchesService.importFromExcel(file.buffer);
    }
}
