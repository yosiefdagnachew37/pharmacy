import { Controller, Get, Patch, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async findAll(@Req() req: any) {
        return this.notificationsService.findAllForUser(req.user.id);
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: any) {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return { count };
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        await this.notificationsService.markAsRead(id);
        return { success: true };
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: any) {
        await this.notificationsService.markAllAsRead(req.user.id);
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.notificationsService.delete(id);
        return { success: true };
    }
}
