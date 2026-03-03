import { Controller, Get, Post, Patch, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationType } from './entities/notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('test')
    async createTest(@Req() req: any) {
        return this.notificationsService.create({
            title: 'Test Notification',
            message: 'This is a test notification to verify the system is working!',
            type: NotificationType.INFO,
            user_id: req.user.userId
        });
    }

    @Get()
    async findAll(@Req() req: any) {
        return this.notificationsService.findAllForUser(req.user.userId);
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: any) {
        const count = await this.notificationsService.getUnreadCount(req.user.userId);
        return { count };
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        await this.notificationsService.markAsRead(id);
        return { success: true };
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: any) {
        await this.notificationsService.markAllAsRead(req.user.userId);
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.notificationsService.delete(id);
        return { success: true };
    }
}
