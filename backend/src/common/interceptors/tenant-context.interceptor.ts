import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { tenantStorage } from '../context/tenant.context';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
    constructor(private dataSource: DataSource) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Note: In a highly concurrent pooled environment, setting session variables 
        // directly on the global dataSource can leak across requests if connections 
        // are reused differently. A more robust approach uses request-scoped EntityManagers
        // or patching the connection pool checkout.
        if (user) {
            const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
            let tenantId = user.organizationId || '';

            // Impersonation support for Super Admin
            if (isSuperAdmin && request.headers['x-organization-id']) {
                tenantId = request.headers['x-organization-id'];
            }

            // Set session variables for RLS
            await this.dataSource.query(`SET app.current_tenant = '${tenantId}'`);
            await this.dataSource.query(`SET app.is_super_admin = '${isSuperAdmin}'`);

            return new Observable(observer => {
                tenantStorage.run({ organizationId: tenantId, userId: user.userId, isSuperAdmin }, () => {
                    next.handle().subscribe(observer);
                });
            });
        } else {
            // Reset for unauthenticated requests just in case of connection reuse
            await this.dataSource.query(`SET app.current_tenant = ''`);
            await this.dataSource.query(`SET app.is_super_admin = 'false'`);
        }

        return next.handle();
    }
}
