import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    create(@Body() createPatientDto: CreatePatientDto) {
        return this.patientsService.create(createPatientDto);
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
    update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
        return this.patientsService.update(id, updatePatientDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.patientsService.remove(id);
    }
}
