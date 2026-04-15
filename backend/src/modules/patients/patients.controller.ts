import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreatePatientReminderDto } from './dto/create-patient-reminder.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
    constructor(
        private readonly patientsService: PatientsService,
        private readonly auditService: AuditService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async create(@Body() createPatientDto: CreatePatientDto, @Request() req: any) {
        const result = await this.patientsService.create(createPatientDto);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.CREATE,
            entity: 'patients',
            entity_id: result.id,
            new_values: { name: result.name },
        });
        return result;
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    findAll() {
        return this.patientsService.findAll();
    }

    @Get('search')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    search(@Query('q') q: string) {
        return this.patientsService.search(q);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    findOne(@Param('id') id: string) {
        return this.patientsService.findOne(id);
    }

    @Patch('reminders/:id/resolve')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    resolveReminder(@Param('id') id: string) {
        return this.patientsService.resolveReminder(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto, @Request() req: any) {
        const result = await this.patientsService.update(id, updatePatientDto);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.UPDATE,
            entity: 'patients',
            entity_id: id,
            new_values: updatePatientDto,
        });
        return result;
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: string, @Request() req: any) {
        const patient = await this.patientsService.findOne(id);
        await this.patientsService.remove(id);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.DELETE,
            entity: 'patients',
            entity_id: id,
            old_values: { name: patient.name },
        });
    }

    @Get(':id/history')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    getHistory(@Param('id') id: string) {
        return this.patientsService.getHistory(id);
    }

    @Post(':id/reminders')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    createReminder(@Param('id') id: string, @Body() createReminderDto: CreatePatientReminderDto, @Request() req: any) {
        return this.patientsService.createReminder(id, createReminderDto, req.user.userId);
    }
}
