import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('batches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BatchesController {
    constructor(private readonly batchesService: BatchesService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    create(@Body() createBatchDto: CreateBatchDto) {
        return this.batchesService.create(createBatchDto);
    }

    @Get()
    findAll() {
        return this.batchesService.findAll();
    }

    @Get('expiring')
    findExpiring(@Query('days') days: string) {
        return this.batchesService.findExpiring(parseInt(days, 10) || 90);
    }

    @Get('expired')
    findExpired() {
        return this.batchesService.findExpired();
    }

    @Get('medicine/:id')
    findByMedicine(@Param('id') id: string) {
        return this.batchesService.findByMedicine(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.batchesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto) {
        return this.batchesService.update(id, updateBatchDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.batchesService.remove(id);
    }
}
