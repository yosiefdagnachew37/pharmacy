import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('medicines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicinesController {
    constructor(private readonly medicinesService: MedicinesService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    create(@Body() createMedicineDto: CreateMedicineDto) {
        return this.medicinesService.create(createMedicineDto);
    }

    @Get()
    findAll() {
        return this.medicinesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.medicinesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    update(@Param('id') id: string, @Body() updateMedicineDto: UpdateMedicineDto) {
        return this.medicinesService.update(id, updateMedicineDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.medicinesService.remove(id);
    }
}
