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

        // If organization name is provided, find the exact match (case-insensitive)
        if (orgName) {
            const exactMatch = matches.find(u => 
                u.organization?.name?.toLowerCase() === orgName.toLowerCase()
            );
            if (!exactMatch) return null;

            // Check if organization is suspended
            if (exactMatch.organization && exactMatch.organization.is_active === false) {
                throw new ForbiddenException('ORGANIZATION_SUSPENDED');
            }

            const { password_hash, ...result } = exactMatch;
            return result;
        }

        // If no organization name provided and multiple matches found -> CONFLICT
        if (matches.length > 1) {
            throw new ConflictException('Ambiguous login. Multiple organizations found with these credentials. Please specify your Pharmacy name.');
        }

        // Single match found — check org suspension
        const singleMatch = matches[0];
        if (singleMatch.organization && singleMatch.organization.is_active === false) {
            throw new ForbiddenException('ORGANIZATION_SUSPENDED');
        }

        const { password_hash, ...result } = singleMatch;
        // Attach the effective subscription status to the user object
        let subStatus = 'TRIAL';
        let subFeatures: string[] = [];

        if (singleMatch.organization) {
            if (singleMatch.organization.subscription_status) {
                subStatus = singleMatch.organization.subscription_status;
            }
            if (singleMatch.organization.subscription_expiry_date && new Date(singleMatch.organization.subscription_expiry_date) < new Date()) {
                subStatus = 'EXPIRED';
            }
            
            // Look up plan features
            const planName = singleMatch.organization.subscription_plan;
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
        return { ...result, subscription_status: subStatus, subscription_features: subFeatures };
    }

    async login(user: any) {
        const payload = { 
            username: user.username, 
            sub: user.id, 
            role: user.role, 
            organizationId: user.organization_id,
            subscription_status: user.subscription_status,
            subscription_features: user.subscription_features || []
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                ...user,
                subscription_status: user.subscription_status,
                subscription_features: user.subscription_features || []
            },
        };
    }

    async register(createUserDto: any) {
        return this.usersService.create(createUserDto);
    }
}
