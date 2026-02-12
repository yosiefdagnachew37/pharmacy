import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
    constructor(private readonly prescriptionsService: PrescriptionsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
        return this.prescriptionsService.create(createPrescriptionDto);
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
    remove(@Param('id') id: string) {
        return this.prescriptionsService.remove(id);
    }
}
