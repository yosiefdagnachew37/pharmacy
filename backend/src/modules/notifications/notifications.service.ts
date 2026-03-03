import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

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
        this.logger.log(`Creating notification: ${data.title} for user: ${data.user_id || 'Broadcast'}`);
        const notification = this.notificationRepository.create(data);
        return this.notificationRepository.save(notification);
    }

    async findAllForUser(userId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: [
                { user_id: userId },
                { user_id: IsNull() }, // broadcasts
            ],
            order: { created_at: 'DESC' },
            take: 50,
        });
    }

    async getUnreadCount(userId: string): Promise<number> {
        const count = await this.notificationRepository.count({
            where: [
                { user_id: userId, is_read: false },
                { user_id: IsNull(), is_read: false },
            ],
        });
        this.logger.debug(`Unread count for user ${userId}: ${count}`);
        return count;
    }

    async markAsRead(id: string): Promise<void> {
        await this.notificationRepository.update(id, { is_read: true });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository
            .createQueryBuilder()
            .update(Notification)
            .set({ is_read: true })
            .where('user_id = :userId OR user_id IS NULL', { userId })
            .andWhere('is_read = false')
            .execute();
    }

    async delete(id: string): Promise<void> {
        await this.notificationRepository.delete(id);
    }
}
