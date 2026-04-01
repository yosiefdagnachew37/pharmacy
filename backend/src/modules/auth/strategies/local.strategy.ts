import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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
            // Re-throw ForbiddenException (e.g. suspended org) so it reaches the client as 403
            if (error instanceof ForbiddenException) {
                throw error;
            }
            // All other errors (including UnauthorizedException) become 401
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid credentials');
        }
    }
}
