import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ passReqToCallback: true }); // Enable request body access
    }

    async validate(req: any, username: string, password: string): Promise<any> {
        const orgName = req.body?.organization_name;
        try {
            const user = await this.authService.validateUser(username, password, orgName);
            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }
            return user;
        } catch (error) {
            // Re-throw specified exceptions so they reach the client with proper status codes
            if (
                error instanceof ForbiddenException || 
                error instanceof ConflictException || 
                error instanceof UnauthorizedException
            ) {
                throw error;
            }
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}
