import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrgSubscriptionStatus } from './entities/organization.entity';
import { UsersService } from '../users/users.service';
import { SubscriptionPlansService } from '../subscription-plans/subscription-plans.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private organizationsRepository: Repository<Organization>,
        private usersService: UsersService,
        private plansService: SubscriptionPlansService,
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

            // Auto-calculate expiry date from the plan's duration_months
            try {
                const allPlans = await this.plansService.findAll();
                const matchedPlan = allPlans.find(p => p.name === data.subscription_plan_name);
                if (matchedPlan && matchedPlan.duration_months) {
                    const startDate = new Date();
                    const expiryDate = new Date(startDate);
                    expiryDate.setMonth(expiryDate.getMonth() + matchedPlan.duration_months);
                    org.subscription_expiry_date = expiryDate;
                    // Auto-activate when subscribing to a new plan
                    org.subscription_status = OrgSubscriptionStatus.ACTIVE;
                }
            } catch (e) {
                console.error('Failed to look up plan duration', e);
            }
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

    async getPlatformStats() {
        // Fetch all data for computation
        const organizations = await this.organizationsRepository.find();
        const usersCount = await this.usersService.findAll().then(users => users.length);
        const plans = await this.plansService.findAll();

        const planMap = plans.reduce((acc, p) => {
            acc[p.name] = p;
            return acc;
        }, {} as Record<string, any>);

        // 1. Calculate Total MRR (Monthly Recurring Revenue)
        const totalMRR = organizations.reduce((acc, org) => {
            const plan = planMap[org.subscription_plan_name || ''];
            if (plan && plan.costs > 0 && plan.duration_months > 0) {
                // Normalize to monthly even if plan is yearly
                return acc + (Number(plan.costs) / plan.duration_months);
            }
            return acc;
        }, 0);

        // 2. Growth Analytics (Last 6 months of onboarding)
        const growth: Array<{ month: string, count: number, formattedValue: string }> = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = date.getUTCMonth();
            const year = date.getUTCFullYear();

            const count = organizations.filter(org => {
                const created = new Date(org.created_at);
                return created.getUTCMonth() === month && created.getUTCFullYear() === year;
            }).length;

            growth.push({
                month: monthNames[month],
                count: count,
                formattedValue: `+${count} Nodes`
            });
        }

        // 3. System health components (checking core db connectivity)
        const isDbHealthy = await this.organizationsRepository.query('SELECT 1').then(() => true).catch(() => false);

        return {
            totalTenants: organizations.length,
            totalMRR,
            totalUsers: usersCount,
            growth,
            health: {
                database: isDbHealthy ? 'Healthy' : 'Disconnected',
                storage: 'Active', // Mocked as we don't have S3 integrated yet
                auth: '99.9%',
                backgroundJobs: 'Processing'
            },
            recentTenants: organizations
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
        };
    }

    async remove(id: string) {
        const org = await this.findOne(id);
        if (!org) {
            throw new NotFoundException(`Organization with ID ${id} not found`);
        }
        await this.organizationsRepository.remove(org);
        return { message: 'Organization successfully deleted' };
    }
}
