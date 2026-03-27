import { AsyncLocalStorage } from 'async_hooks';

export interface TenantData {
  organizationId: string;
  userId: string;
  isSuperAdmin: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantData>();
