import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
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
            if (exactMatch) {
                const { password_hash, ...result } = exactMatch;
                return result;
            }
            return null;
        }

        // If no organization name provided and multiple matches found -> CONFLICT
        if (matches.length > 1) {
            throw new ConflictException('Ambiguous login. Multiple organizations found with these credentials. Please specify your Pharmacy name.');
        }

        // Single match found
        const { password_hash, ...result } = matches[0];
        return result;
    }

    async login(user: any) {
        const payload = { 
            username: user.username, 
            sub: user.id, 
            role: user.role, 
            organizationId: user.organization_id,
            organizationName: user.organization?.name || 'N/A'
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                organizationId: user.organization_id,
                organizationName: user.organization?.name || 'N/A'
            },
        };
    }

    async register(createUserDto: any) {
        return this.usersService.create(createUserDto);
    }
}
