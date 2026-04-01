import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { RequireFeature } from '../../common/decorators/feature.decorator';
import { FeatureGuard } from '../../common/guards/feature.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard, FeatureGuard)
@RequireFeature('Expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Get()
    findAll() {
        return this.expensesService.findAll();
    }

    @Get('daily-expected')
    getDailyExpected() {
        return this.expensesService.getDailyExpectedExpense();
    }

    @Get('monthly-summary')
    getMonthlySummary(@Query('year') year: string, @Query('month') month: string) {
        const y = year ? parseInt(year) : new Date().getFullYear();
        const m = month ? parseInt(month) : new Date().getMonth() + 1;
        return this.expensesService.getMonthlySummary(y, m);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.expensesService.findOne(id);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() body: any, @Request() req: any) {
        return this.expensesService.create(body, req.user.userId);
    }

    @Put(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() body: any) {
        return this.expensesService.update(id, body);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.expensesService.remove(id);
    }
}
