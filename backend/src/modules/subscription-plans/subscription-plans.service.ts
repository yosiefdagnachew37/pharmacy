import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private repo: Repository<SubscriptionPlan>,
  ) {}

  async findAll() {
    return this.repo.find({ order: { monthly_price: 'ASC' } });
  }

  async findByName(name: string) {
    return this.repo.findOne({ where: { name } });
  }

  async findOne(id: string) {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(data: Partial<SubscriptionPlan>) {
    const plan = this.repo.create(data);
    return this.repo.save(plan);
  }

  async update(id: string, data: Partial<SubscriptionPlan>) {
    const plan = await this.findOne(id);
    Object.assign(plan, data);
    return this.repo.save(plan);
  }

  async remove(id: string) {
    const plan = await this.findOne(id);
    return this.repo.remove(plan);
  }
}
