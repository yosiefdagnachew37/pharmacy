import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { PaymentAccount, PaymentAccountType } from './entities/payment-account.entity';
import { PaymentAccountTransaction, TransactionType, ReferenceType } from './entities/payment-account-transaction.entity';
import { CreatePaymentAccountDto } from './dto/create-payment-account.dto';
import { getTenantId } from '../../common/utils/tenant-query';
import { Request } from 'express';

@Injectable()
export class PaymentAccountsService {
  constructor(
    @InjectRepository(PaymentAccount)
    private readonly repo: Repository<PaymentAccount>,
    @InjectRepository(PaymentAccountTransaction)
    private readonly transactionRepo: Repository<PaymentAccountTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<PaymentAccount[]> {
    return this.repo.find({
      where: { organization_id: getTenantId() },
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
}
