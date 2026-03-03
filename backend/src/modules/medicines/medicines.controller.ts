import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Controller('medicines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicinesController {
    constructor(
        private readonly medicinesService: MedicinesService,
        private readonly auditService: AuditService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async create(@Body() createMedicineDto: CreateMedicineDto, @Request() req: any) {
        const result = await this.medicinesService.create(createMedicineDto);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.CREATE,
            entity: 'medicines',
            entity_id: result.id,
            new_values: createMedicineDto,
        });
        return result;
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    findAll() {
        return this.medicinesService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    findOne(@Param('id') id: string) {
        return this.medicinesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto, @Request() req: any) {
        const oldMedicine = await this.medicinesService.findOne(id);
        const result = await this.medicinesService.update(id, updateMedicineDto);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.UPDATE,
            entity: 'medicines',
            entity_id: id,
            old_values: { name: oldMedicine.name, category: oldMedicine.category, unit: oldMedicine.unit },
            new_values: updateMedicineDto,
        });
        return result;
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: string, @Request() req: any) {
        const medicine = await this.medicinesService.findOne(id);
        await this.medicinesService.remove(id);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.DELETE,
            entity: 'medicines',
            entity_id: id,
            old_values: { name: medicine.name },
        });
    }

    @Post('import')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    @UseInterceptors(FileInterceptor('file'))
    async importExcel(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            return { created: 0, errors: [{ row: 0, message: 'No file uploaded' }] };
        }
        return this.medicinesService.importFromExcel(file.buffer);
    }
}
