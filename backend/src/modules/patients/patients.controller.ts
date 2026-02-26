import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
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
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
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
    findAll() {
        return this.patientsService.findAll();
    }

    @Get('search')
    search(@Query('q') q: string) {
        return this.patientsService.search(q);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.patientsService.findOne(id);
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
    getHistory(@Param('id') id: string) {
        return this.patientsService.getHistory(id);
    }
}
