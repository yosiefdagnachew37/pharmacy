import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SubscriptionPlansService } from '../subscription-plans/subscription-plans.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private plansService: SubscriptionPlansService
    ) { }

    async validateUser(username: string, pass: string, orgName?: string): Promise<any> {
        const users = await this.usersService.findByUsername(username);
        
        const matches: User[] = [];
        for (const user of users) {
             if (user.password_hash && (await bcrypt.compare(pass, user.password_hash))) {
                 matches.push(user);
             }
        }

        if (matches.length === 0) return null;

        let targetedUser: User | null = null;

        if (orgName) {
            targetedUser = matches.find(u => 
                u.organization?.name?.toLowerCase() === orgName.toLowerCase()
            ) || null;
            if (!targetedUser) return null;
        } else {
            if (matches.length > 1) {
                throw new ConflictException('Ambiguous login. Multiple organizations found with these credentials. Please specify your Pharmacy name.');
            }
            targetedUser = matches[0];
        }

        if (targetedUser.is_active === false) {
            throw new ForbiddenException('USER_DEACTIVATED');
        }

        if (targetedUser.organization && targetedUser.organization.is_active === false) {
            throw new ForbiddenException('ORGANIZATION_SUSPENDED');
        }

        const { password_hash, ...result } = targetedUser;
        
        // Attach the effective subscription status to the user object
        let subStatus = 'TRIAL';
        let subFeatures: string[] = [];

        if (targetedUser.organization) {
            if (targetedUser.organization.subscription_status) {
                subStatus = targetedUser.organization.subscription_status;
            }
            
            // Zero-tolerance expiry lockout (skip for SUPER_ADMIN)
            if (targetedUser.role !== 'SUPER_ADMIN' &&
                targetedUser.organization.subscription_expiry_date && 
                new Date(targetedUser.organization.subscription_expiry_date) < new Date()) {
                throw new ForbiddenException('SUBSCRIPTION_EXPIRED');
            }
            
            // Look up plan features
            const planName = targetedUser.organization.subscription_plan_name || targetedUser.organization.subscription_plan;
            if (planName) {
                try {
                    const allPlans = await this.plansService.findAll();
                    const activePlan = allPlans.find(p => p.name === planName);
                    if (activePlan && activePlan.is_active && activePlan.features) {
                        subFeatures = activePlan.features;
                    }
                } catch (e) {
                    console.error('Failed to fetch plan features', e);
                }
            }
        }
        return { 
            ...result, 
            subscription_status: subStatus, 
            subscription_features: subFeatures,
            subscription_expiry_date: targetedUser.organization?.subscription_expiry_date || null
        };
    }

    async login(user: any) {
        const payload = { 
            username: user.username, 
            sub: user.id, 
            role: user.role, 
            organizationId: user.organization_id,
            subscription_status: user.subscription_status,
            subscription_features: user.subscription_features || [],
            subscription_expiry_date: user.subscription_expiry_date || null
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                ...user,
                subscription_status: user.subscription_status,
                subscription_features: user.subscription_features || [],
                subscription_expiry_date: user.subscription_expiry_date || null
            },
        };
    }

    async register(createUserDto: any) {
        return this.usersService.create(createUserDto);
    }
}
