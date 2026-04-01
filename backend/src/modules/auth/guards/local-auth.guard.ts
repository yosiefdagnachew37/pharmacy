import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    handleRequest(err: any, user: any, info: any, context: any, status: any) {
        // If the strategy throws an explicit error (like ForbiddenException for suspended orgs), re-throw it!
        if (err) {
            throw err;
        }
        if (!user) {
            throw new UnauthorizedException(info?.message || 'Unauthorized');
        }
        return user;
    }
}
