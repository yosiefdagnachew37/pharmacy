import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, Request, Query,
} from '@nestjs/common';
import { PaymentAccountsService } from './payment-accounts.service';
import { CreatePaymentAccountDto } from './dto/create-payment-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('payment-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentAccountsController {
  constructor(private readonly service: PaymentAccountsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user?.role);
  }

  @Get('active')
  findActive() {
    return this.service.findActive();
  }

  // --- TRANSFERS ---

  @Post('transfer-request')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.SUPER_ADMIN)
  createTransferRequest(
    @Body() body: { from_account_id: string; to_account_id: string; amount: number; reason: string },
    @Request() req: any
  ) {
    return this.service.createTransferRequest(
      body.from_account_id,
      body.to_account_id,
      body.amount,
      body.reason || '',
      req.user.userId,
      req.user.role
    );
  }

  @Get('transfer-request')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.SUPER_ADMIN)
  getTransferRequests(@Request() req: any) {
    return this.service.getTransferRequests(req.user.role, req.user.userId);
  }

  @Post('transfer-request/:id/approve')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  approveTransferRequest(@Param('id') id: string, @Request() req: any) {
    return this.service.approveTransferRequest(id, req.user.userId);
  }

  @Post('transfer-request/:id/reject')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  rejectTransferRequest(@Param('id') id: string) {
    return this.service.rejectTransferRequest(id);
  }

  @Get('transactions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AUDITOR, UserRole.CASHIER)
  getAllTransactions(@Query('date') date?: string) {
    return this.service.getTransactions(undefined, { date });
  }

  @Get(':id/transactions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.AUDITOR, UserRole.CASHIER)
  getAccountTransactions(@Param('id') id: string, @Query('date') date?: string) {
    return this.service.getTransactions(id, { date });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreatePaymentAccountDto, @Request() req: any) {
    return this.service.create(dto, req);
  }

  @Post(':id/withdraw')
  @Roles(UserRole.ADMIN, UserRole.CASHIER, UserRole.SUPER_ADMIN)
  withdraw(@Param('id') id: string, @Body() body: { amount: number, reason: string }, @Request() req: any) {
    return this.service.withdraw(id, body.amount, body.reason, req.user?.userId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: CreatePaymentAccountDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
