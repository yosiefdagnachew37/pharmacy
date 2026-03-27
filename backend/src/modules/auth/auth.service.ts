import { Injectable, UnauthorizedException } from '@nestjs/common';
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
        const user = await this.usersService.findOne(username, orgName);
        if (user && (await bcrypt.compare(pass, user.password_hash))) { // Compare hash
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
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
