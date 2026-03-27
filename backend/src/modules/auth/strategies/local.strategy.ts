import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ passReqToCallback: true }); // Enable request body access
    }

    async validate(req: any, username: string, password: string): Promise<any> {
        const orgName = req.body?.organization_name;
        const user = await this.authService.validateUser(username, password, orgName);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
