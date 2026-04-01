import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrgSubscriptionStatus } from './entities/organization.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { SubscriptionPlansService } from '../subscription-plans/subscription-plans.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private organizationsRepository: Repository<Organization>,
        private usersService: UsersService,
        private subscriptionPlansService: SubscriptionPlansService,
    ) { }

    findAll() {
        return this.organizationsRepository.find();
    }

    async findOne(id: string) {
        const org = await this.organizationsRepository.findOne({ where: { id } });
        if (!org) throw new NotFoundException('Organization not found');
        return org;
    }

    async findUsers(id: string) {
        return this.usersService.findByOrganization(id);
    }

    async create(data: any) {
        const { admin_username, admin_password, ...orgData } = data;
        
        return this.organizationsRepository.manager.transaction(async (manager) => {
            const org = manager.create(Organization, orgData);
            
            // Set initial subscription details (Duration calculated from plan)
            if (org.subscription_plan_name) {
                try {
                    const plan = await this.subscriptionPlansService.findByName(org.subscription_plan_name);
                    if (plan) {
                        const expiry = new Date();
                        expiry.setMonth(expiry.getMonth() + plan.duration_months);
                        org.subscription_expiry_date = expiry;
                        org.subscription_status = OrgSubscriptionStatus.ACTIVE;
                    }
                } catch (e) {}
            }
            if (!org.subscription_expiry_date) {
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + 30);
                org.subscription_status = OrgSubscriptionStatus.ACTIVE;
                org.subscription_expiry_date = trialEnd;
            }

            const savedOrg = await manager.save(org);

            if (admin_username && admin_password) {
                const existing = await manager.findOne(User, {
                    where: { username: admin_username, organization_id: savedOrg.id }
                });

                if (!existing) {
                    const salt = await bcrypt.genSalt();
                    const password_hash = await bcrypt.hash(admin_password, salt);

                    const adminUser = manager.create(User, {
                        username: admin_username,
                        password_hash,
                        role: UserRole.ADMIN,
                        organization_id: savedOrg.id,
                    });
                    await manager.save(adminUser);
                }
            }

            return savedOrg;
        });
    }

    async update(id: string, data: Partial<Organization>) {
        await this.organizationsRepository.update(id, data);
        return this.findOne(id);
    }

    async updateStatus(id: string, is_active: boolean) {
        const org = await this.findOne(id);
        org.is_active = is_active;
        return this.organizationsRepository.save(org);
    }

    async suspend(id: string) {
        return this.updateStatus(id, false);
    }

    async activate(id: string) {
        return this.updateStatus(id, true);
    }

    async updateSubscription(id: string, data: {
        subscription_plan_name?: string;
        subscription_status?: string;
        subscription_expiry_date?: string;
        extend_days?: number;
    }) {
        const org = await this.findOne(id);

        if (data.subscription_plan_name !== undefined) {
            org.subscription_plan_name = data.subscription_plan_name;
            try {
                const plan = await this.subscriptionPlansService.findByName(data.subscription_plan_name);
                if (plan) {
                    const expiry = new Date();
                    expiry.setMonth(expiry.getMonth() + plan.duration_months);
                    // Override the incoming expiry if calculating from plan
                    data.subscription_expiry_date = expiry.toISOString();
                }
            } catch (e) { }
        }
        
        if (data.subscription_status !== undefined) {
            org.subscription_status = data.subscription_status as OrgSubscriptionStatus;
        }
        
        if (data.subscription_expiry_date !== undefined) {
            org.subscription_expiry_date = new Date(data.subscription_expiry_date);
        }
        
        if (data.extend_days !== undefined && data.extend_days > 0) {
            const base = org.subscription_expiry_date && org.subscription_expiry_date > new Date()
                ? new Date(org.subscription_expiry_date)
                : new Date();
            base.setDate(base.getDate() + data.extend_days);
            org.subscription_expiry_date = base;
            // Auto-activate when extending
            if (org.subscription_status === OrgSubscriptionStatus.EXPIRED) {
                org.subscription_status = OrgSubscriptionStatus.ACTIVE;
            }
        }

        return this.organizationsRepository.save(org);
    }

    // Check subscription status based on expiry date (called at login)
    getEffectiveSubscriptionStatus(org: Organization): OrgSubscriptionStatus {
        if (!org.subscription_status) return OrgSubscriptionStatus.TRIAL;
        if (org.subscription_status === OrgSubscriptionStatus.SUSPENDED) {
            return OrgSubscriptionStatus.SUSPENDED;
        }
        if (org.subscription_expiry_date && org.subscription_expiry_date < new Date()) {
            return OrgSubscriptionStatus.EXPIRED;
        }
        return org.subscription_status;
    }
}
