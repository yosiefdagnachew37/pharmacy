import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { tenantStorage } from '../context/tenant.context';
export { tenantStorage };

export function scopeQuery<T extends ObjectLiteral>(queryBuilder: SelectQueryBuilder<T>, alias: string): SelectQueryBuilder<T> {
  const store = tenantStorage.getStore();
  
  if (!store) {
    return queryBuilder;
  }

  // Super admins see everything
  if (store.isSuperAdmin) {
    return queryBuilder;
  }

  if (!store.organizationId) {
    throw new UnauthorizedException('Organization context missing');
  }

  return queryBuilder.andWhere(`${alias}.organization_id = :orgId`, { orgId: store.organizationId });
}

export function getTenantId(): string {
  const store = tenantStorage.getStore();
  if (!store || (!store.organizationId && !store.isSuperAdmin)) {
    throw new UnauthorizedException('Organization context missing');
  }
  return store.organizationId || '';
}

export const TenantQuery = {
  scopeQuery,
  getTenantId,
  tenantStorage,
};
