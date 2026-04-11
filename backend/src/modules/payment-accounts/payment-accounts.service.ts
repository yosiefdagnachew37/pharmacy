import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentAccount, PaymentAccountType } from './entities/payment-account.entity';
import { CreatePaymentAccountDto } from './dto/create-payment-account.dto';
import { getTenantId } from '../../common/utils/tenant-query';

@Injectable()
export class PaymentAccountsService {
  constructor(
    @InjectRepository(PaymentAccount)
    private readonly repo: Repository<PaymentAccount>,
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

  async create(dto: CreatePaymentAccountDto): Promise<PaymentAccount> {
    const account = this.repo.create({
      ...dto,
      type: dto.type ?? PaymentAccountType.CASH,
      is_active: dto.is_active ?? true,
      organization_id: getTenantId(),
    });
    return this.repo.save(account);
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
}
