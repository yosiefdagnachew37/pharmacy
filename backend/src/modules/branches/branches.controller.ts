import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }

    @Get()
    findAll() {
        return this.branchesService.findAll();
    }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() data: any) {
        return this.branchesService.create(data);
    }
}
