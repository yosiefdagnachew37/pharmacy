import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';
import { tenantStorage } from '../context/tenant.context';

@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
  
  beforeInsert(event: InsertEvent<any>) {
    this.injectTenantContext(event.entity);
  }

  beforeUpdate(event: UpdateEvent<any>) {
    this.injectTenantContext(event.entity);
  }

  private injectTenantContext(entity: any) {
    if (!entity) return;

    const store = tenantStorage.getStore();
    if (!store) return;

    // Auto-inject organization_id if it exists on the entity and is missing
    if ('organization_id' in entity && !entity.organization_id) {
      entity.organization_id = store.organizationId;
    }
  }
}
