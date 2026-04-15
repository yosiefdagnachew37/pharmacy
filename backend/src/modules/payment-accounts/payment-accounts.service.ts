import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { PaymentAccount, PaymentAccountType } from './entities/payment-account.entity';
import { PaymentAccountTransaction, TransactionType, ReferenceType } from './entities/payment-account-transaction.entity';
import { TransferRequest, TransferRequestStatus } from './entities/transfer-request.entity';
import { CreatePaymentAccountDto } from './dto/create-payment-account.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { getTenantId } from '../../common/utils/tenant-query';
import { Request } from 'express';

@Injectable()
export class PaymentAccountsService {
  constructor(
    @InjectRepository(PaymentAccount)
    private readonly repo: Repository<PaymentAccount>,
    @InjectRepository(PaymentAccountTransaction)
    private readonly transactionRepo: Repository<PaymentAccountTransaction>,
    @InjectRepository(TransferRequest)
    private readonly transferRepo: Repository<TransferRequest>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userRole?: string): Promise<PaymentAccount[]> {
    const whereClause: any = { organization_id: getTenantId() };
    if (userRole === UserRole.CASHIER) {
      whereClause.is_visible_to_cashier = true;
    }
    return this.repo.find({
      where: whereClause,
      order: { name: 'ASC' },
    });
  }

  async findActive(): Promise<PaymentAccount[]> {
    return this.repo.find({
      where: { organization_id: getTenantId(), is_active: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PaymentAccount> {
    const account = await this.repo.findOne({
      where: { id, organization_id: getTenantId() },
    });
    if (!account) throw new NotFoundException(`Payment account ${id} not found`);
    return account;
  }

  async create(dto: CreatePaymentAccountDto, req?: any): Promise<PaymentAccount> {
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000000'; // Fallback if no req available

    return this.dataSource.transaction(async (manager) => {
      const account = manager.create(PaymentAccount, {
        ...dto,
        type: dto.type ?? PaymentAccountType.CASH,
        is_active: dto.is_active ?? true,
        is_visible_to_cashier: dto.is_visible_to_cashier ?? true,
        allow_transfer: dto.allow_transfer ?? true,
        organization_id: getTenantId(),
        balance: dto.initial_balance || 0,
      });

      const savedAccount = await manager.save(account);

      if (dto.initial_balance && dto.initial_balance > 0) {
        const transaction = manager.create(PaymentAccountTransaction, {
          payment_account_id: savedAccount.id,
          amount: dto.initial_balance,
          type: TransactionType.CREDIT,
          reference_type: ReferenceType.INITIAL_BALANCE,
          description: 'Initial Account Balance',
          created_by: userId,
          organization_id: getTenantId(),
        });
        await manager.save(transaction);
      }

      return savedAccount;
    });
  }

  async update(id: string, dto: Partial<CreatePaymentAccountDto>): Promise<PaymentAccount> {
    const account = await this.findOne(id);
    Object.assign(account, dto);
    return this.repo.save(account);
  }

  async remove(id: string): Promise<void> {
    const account = await this.findOne(id);
    await this.repo.remove(account);
  }

  async getTransactions(accountId?: string, filters?: { date?: string }): Promise<PaymentAccountTransaction[]> {
    const query = this.transactionRepo.createQueryBuilder('tx')
      .where('tx.organization_id = :orgId', { orgId: getTenantId() })
      .orderBy('tx.created_at', 'DESC');

    if (accountId) {
      query.andWhere('tx.payment_account_id = :accountId', { accountId });
    } else {
      query.leftJoinAndSelect('tx.payment_account', 'account');
    }

    if (filters?.date) {
      // Expecting YYYY-MM-DD
      const startOfDay = `${filters.date}T00:00:00.000Z`;
      const endOfDay = `${filters.date}T23:59:59.999Z`;
      query.andWhere('tx.created_at >= :start', { start: startOfDay })
           .andWhere('tx.created_at <= :end', { end: endOfDay });
    }

    return query.getMany();
  }

  async withdraw(id: string, amount: number, reason: string, userId: string): Promise<PaymentAccountTransaction> {
    if (amount <= 0) throw new Error('Withdrawal amount must be greater than zero');

    return this.dataSource.transaction(async (manager) => {
      const orgId = getTenantId();
      const paymentAccount = await manager.findOne(PaymentAccount, {
        where: { id, organization_id: orgId }
      });

      if (!paymentAccount) throw new NotFoundException(`Payment account not found`);

      // Allow negative balance if that's what the business workflow forces, or we can restrict it.
      // Usually registers shouldn't dip below 0, but for flexibility we just deduct.
      if (Number(paymentAccount.balance || 0) < amount) {
          throw new Error('Insufficient funds in the selected payment account');
      }

      paymentAccount.balance = Number(paymentAccount.balance || 0) - amount;
      await manager.save(paymentAccount);

      const transaction = manager.create(PaymentAccountTransaction, {
        payment_account_id: paymentAccount.id,
        amount: amount,
        type: TransactionType.DEBIT,
        reference_type: ReferenceType.MANUAL_ADJUSTMENT,
        description: `Withdrawal: ${reason || 'Cash withdrawal'}`,
        created_by: userId,
        organization_id: orgId,
      });

      return manager.save(transaction);
    });
  }

  // --- TRANSFERS ---

  async createTransferRequest(fromAccountId: string, toAccountId: string, amount: number, reason: string, userId: string, role: string): Promise<TransferRequest> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    if (fromAccountId === toAccountId) throw new BadRequestException('Cannot transfer to the same account');

    const fromAccount = await this.repo.findOne({ where: { id: fromAccountId, organization_id: getTenantId() } });
    if (!fromAccount) throw new NotFoundException('Source account not found');

    const toAccount = await this.repo.findOne({ where: { id: toAccountId, organization_id: getTenantId() } });
    if (!toAccount) throw new NotFoundException('Destination account not found');

    if (role === UserRole.CASHIER && !fromAccount.allow_transfer) {
      throw new BadRequestException('You do not have permission to transfer from this account');
    }

    if (Number(fromAccount.balance || 0) < amount) {
      throw new BadRequestException('Insufficient funds in the source account');
    }

    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

    const request = this.transferRepo.create({
      from_account_id: fromAccountId,
      to_account_id: toAccountId,
      amount,
      reason,
      status: TransferRequestStatus.PENDING,
      requested_by: userId,
      organization_id: getTenantId(),
    });

    const savedRequest = await this.transferRepo.save(request);

    if (isAdmin) {
      await this.processTransfer(savedRequest.id, userId);
    }

    const result = await this.transferRepo.findOne({ where: { id: savedRequest.id }, relations: ['from_account', 'to_account'] });
    if (!result) throw new NotFoundException('Transfer request not found');
    return result;
  }

  async getTransferRequests(role: string, userId: string): Promise<TransferRequest[]> {
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
    const where: any = { organization_id: getTenantId() };
    
    if (!isAdmin) {
      where.requested_by = userId;
    }

    return this.transferRepo.find({
      where,
      relations: ['from_account', 'to_account'],
      order: { created_at: 'DESC' },
    });
  }

  async approveTransferRequest(requestId: string, adminId: string): Promise<TransferRequest> {
    return this.processTransfer(requestId, adminId);
  }

  async rejectTransferRequest(requestId: string): Promise<TransferRequest> {
    const request = await this.transferRepo.findOne({ where: { id: requestId, organization_id: getTenantId() } });
    if (!request) throw new NotFoundException('Transfer request not found');
    if (request.status !== TransferRequestStatus.PENDING) {
      throw new BadRequestException(`Cannot reject a request that is already ${request.status}`);
    }

    request.status = TransferRequestStatus.REJECTED;
    return this.transferRepo.save(request);
  }

  private async processTransfer(requestId: string, adminId: string): Promise<TransferRequest> {
    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(TransferRequest, {
        where: { id: requestId, organization_id: getTenantId() },
        relations: ['from_account', 'to_account']
      });

      if (!request) throw new NotFoundException('Transfer request not found');
      if (request.status === TransferRequestStatus.APPROVED && request.approved_by !== adminId) {
          // If already approved (by the auto-approve flow), we just proceed since we lock and update its state as well.
      } else if (request.status !== TransferRequestStatus.PENDING) {
         throw new BadRequestException(`Cannot process a request that is ${request.status}`);
      }

      if (Number(request.from_account.balance || 0) < Number(request.amount)) {
        throw new BadRequestException('Insufficient funds in the source account to process this transfer');
      }

      // Deduct
      request.from_account.balance = Number(request.from_account.balance || 0) - Number(request.amount);
      await manager.save(request.from_account);

      const debitTx = manager.create(PaymentAccountTransaction, {
        payment_account_id: request.from_account_id,
        amount: request.amount,
        type: TransactionType.DEBIT,
        reference_type: ReferenceType.MANUAL_ADJUSTMENT,
        reference_id: request.id,
        description: `Transfer out to ${request.to_account.name}`,
        created_by: adminId,
        organization_id: getTenantId(),
      });
      await manager.save(debitTx);

      // Add
      request.to_account.balance = Number(request.to_account.balance || 0) + Number(request.amount);
      await manager.save(request.to_account);

      const creditTx = manager.create(PaymentAccountTransaction, {
        payment_account_id: request.to_account_id,
        amount: request.amount,
        type: TransactionType.CREDIT,
        reference_type: ReferenceType.MANUAL_ADJUSTMENT,
        reference_id: request.id,
        description: `Transfer in from ${request.from_account.name}`,
        created_by: adminId,
        organization_id: getTenantId(),
      });
      await manager.save(creditTx);

      // Update request
      request.status = TransferRequestStatus.APPROVED;
      request.approved_by = adminId;
      return manager.save(request);
    });
  }
}
