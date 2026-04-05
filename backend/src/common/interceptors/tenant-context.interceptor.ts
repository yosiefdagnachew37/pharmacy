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
            let dbIsSuperAdmin = isSuperAdmin;

            // Impersonation support for Super Admin
            if (isSuperAdmin && request.headers['x-organization-id']) {
                tenantId = request.headers['x-organization-id'];
                // When impersonating, we want RLS to filter by the organization_id, 
                // so we tell the DB we are NOT a superadmin for this session.
                dbIsSuperAdmin = false;
            }

            // Set session variables for RLS using sanitized values via set_config
            // This is safer and supports parameters ($1, $2, etc.) unlike the SET command.
            await this.dataSource.query(`SELECT set_config('app.current_tenant', $1, false)`, [tenantId]);
            await this.dataSource.query(`SELECT set_config('app.is_super_admin', $1, false)`, [dbIsSuperAdmin.toString()]);

            return new Observable(observer => {
                tenantStorage.run({ organizationId: tenantId, userId: user.userId, isSuperAdmin: dbIsSuperAdmin }, () => {
                    next.handle().subscribe(observer);
                });
            });
        } else {
            // Reset for unauthenticated requests
            await this.dataSource.query(`SELECT set_config('app.current_tenant', '', false)`);
            await this.dataSource.query(`SELECT set_config('app.is_super_admin', 'false', false)`);
        }

        return next.handle();
    }
}
