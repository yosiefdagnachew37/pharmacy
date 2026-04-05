import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Organization } from './entities/organization.entity';

@Controller('admin/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminBillingController {
    constructor(private readonly organizationsService: OrganizationsService) {
        console.log('--- AdminBillingController Initiated ---');
    }

    @Get('upgrade-requests')
    async findAllRequests(@Query('status') status?: string) {
        console.log('--- AdminBilling: Handling findAllRequests --- Status:', status);
        return await this.organizationsService.findAllRequests(status);
    }

    @Patch('upgrade-requests/:id/approve')
    async approveRequest(@Param('id') id: string, @Body('adminNotes') adminNotes?: string) {
        return await this.organizationsService.processRequest(id, 'APPROVED', adminNotes);
    }

    @Patch('upgrade-requests/:id/reject')
    async rejectRequest(@Param('id') id: string, @Body('adminNotes') adminNotes?: string) {
        return await this.organizationsService.processRequest(id, 'REJECTED', adminNotes);
    }
}

@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Get('stats')
    async getStats() {
        return await this.organizationsService.getPlatformStats();
    }

    @Get()
    async findAll() {
        return await this.organizationsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.organizationsService.findOne(id);
    }

    @Get(':id/users')
    async findUsers(@Param('id') id: string) {
        return await this.organizationsService.findUsers(id);
    }

    @Post()
    async create(@Body() data: Partial<Organization>) {
        return await this.organizationsService.create(data);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: Partial<Organization>) {
        return await this.organizationsService.update(id, data);
    }

    @Patch(':id/status')
    async toggleStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
        return await this.organizationsService.updateStatus(id, is_active);
    }

    @Patch(':id/suspend')
    async suspend(@Param('id') id: string) {
        return await this.organizationsService.suspend(id);
    }

    @Patch(':id/activate')
    async activate(@Param('id') id: string) {
        return await this.organizationsService.activate(id);
    }

    @Patch(':id/subscription')
    async updateSubscription(@Param('id') id: string, @Body() data: {
        subscription_plan_name?: string;
        subscription_status?: string;
        subscription_expiry_date?: string;
        extend_days?: number;
    }) {
        return await this.organizationsService.updateSubscription(id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.organizationsService.remove(id);
    }
}

// Separate controller for non-admin org access (any authenticated user)
@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class MyOrganizationController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Get('my-org')
    async getMyOrg(@Request() req: any) {
        const orgId = req.user?.organizationId;
        if (!orgId) return { name: 'Pharmacy', address: '', phone: '', license_number: '', city: '' };
        return await this.organizationsService.findOne(orgId);
    }

    @Get('subscription')
    async getSubscription(@Request() req: any) {
        const orgId = req.user?.organizationId;
        if (!orgId) return null;
        return await this.organizationsService.getSubscriptionDetails(orgId);
    }

    @Post('request-upgrade')
    async requestUpgrade(@Request() req: any, @Body() body: { planId: string; notes?: string }) {
        const orgId = req.user?.organizationId;
        if (!orgId) return null;
        return await this.organizationsService.requestUpgrade(orgId, body.planId, body.notes);
    }

    @Get('subscription/my-requests')
    async getMyRequests(@Request() req: any) {
        const orgId = req.user?.organizationId;
        if (!orgId) return [];
        return await this.organizationsService.findMyRequests(orgId);
    }
}
