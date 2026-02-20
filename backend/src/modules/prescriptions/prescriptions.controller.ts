import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
    constructor(
        private readonly prescriptionsService: PrescriptionsService,
        private readonly auditService: AuditService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    async create(@Body() createPrescriptionDto: CreatePrescriptionDto, @Request() req: any) {
        const result = await this.prescriptionsService.create(createPrescriptionDto);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.CREATE,
            entity: 'prescriptions',
            entity_id: result.id,
            new_values: { patient_id: result.patient_id, doctor_name: result.doctor_name, items_count: result.items?.length },
        });
        return result;
    }

    @Get()
    findAll() {
        return this.prescriptionsService.findAll();
    }

    @Get('patient/:id')
    findByPatient(@Param('id') id: string) {
        return this.prescriptionsService.findByPatient(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.prescriptionsService.findOne(id);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: string, @Request() req: any) {
        await this.prescriptionsService.remove(id);
        await this.auditService.log({
            user_id: req.user.userId,
            action: AuditAction.DELETE,
            entity: 'prescriptions',
            entity_id: id,
        });
    }
}
