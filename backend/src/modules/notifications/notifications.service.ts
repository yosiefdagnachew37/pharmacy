import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { getTenantId } from '../../common/utils/tenant-query';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async create(data: {
        user_id?: string;
        title: string;
        message: string;
        type: NotificationType;
    }): Promise<Notification> {
        const organization_id = getTenantId();
        this.logger.log(`Creating notification: ${data.title} for user: ${data.user_id || 'Broadcast'} in org: ${organization_id}`);
        const notification = this.notificationRepository.create({ ...data, organization_id });
        return this.notificationRepository.save(notification);
    }

    async findAllForUser(userId: string): Promise<Notification[]> {
        const organization_id = getTenantId();
        return this.notificationRepository.find({
            where: [
                { user_id: userId, organization_id },
                { user_id: IsNull(), organization_id }, // scoped broadcasts
            ],
            order: { created_at: 'DESC' },
            take: 50,
        });
    }

    async getUnreadCount(userId: string): Promise<number> {
        const organization_id = getTenantId();
        const count = await this.notificationRepository.count({
            where: [
                { user_id: userId, is_read: false, organization_id },
                { user_id: IsNull(), is_read: false, organization_id },
            ],
        });
        this.logger.debug(`Unread count for user ${userId}: ${count}`);
        return count;
    }

    async markAsRead(id: string): Promise<void> {
        await this.notificationRepository.update(
            { id, organization_id: getTenantId() }, 
            { is_read: true }
        );
    }

    async markAllAsRead(userId: string): Promise<void> {
        const organization_id = getTenantId();
        await this.notificationRepository
            .createQueryBuilder()
            .update(Notification)
            .set({ is_read: true })
            .where('(user_id = :userId OR user_id IS NULL)', { userId })
            .andWhere('organization_id = :organization_id', { organization_id })
            .andWhere('is_read = false')
            .execute();
    }

    async delete(id: string): Promise<void> {
        await this.notificationRepository.delete({ id, organization_id: getTenantId() });
    }
}
