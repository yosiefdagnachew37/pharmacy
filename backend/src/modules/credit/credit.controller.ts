import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CreditService } from './credit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('credit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CreditController {
    constructor(private readonly creditService: CreditService) { }

    @Get('customers')
    getAllCustomers() {
        return this.creditService.findAllCustomers();
    }

    @Get('summary')
    getSummary() {
        return this.creditService.getCreditSummary();
    }

    @Get('overdue')
    getOverdue() {
        return this.creditService.getOverdueCredits();
    }

    @Get('payments')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.AUDITOR)
    getPaymentsHistory(@Query('customerId') customerId?: string) {
        return this.creditService.getPaymentsHistory(customerId);
    }

    @Get('cheques')
    getCheques(@Query('customerId') customerId?: string) {
        return this.creditService.getCheques(customerId);
    }

    @Get('customers/:id')
    getCustomerData(@Param('id') id: string) {
        return this.creditService.getCustomerWithCredit(id);
    }

    @Post('customers')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    createCustomer(@Body() body: any) {
        return this.creditService.createCustomer(body);
    }

    @Put('customers/:id')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST)
    updateCustomer(@Param('id') id: string, @Body() body: any) {
        return this.creditService.updateCustomer(id, body);
    }

    // Process Repayment
    @Post('payments')
    @Roles(UserRole.ADMIN, UserRole.PHARMACIST, UserRole.CASHIER)
    processPayment(@Body() body: any, @Request() req: any) {
        return this.creditService.processPayment(body, req.user.userId);
    }
}
