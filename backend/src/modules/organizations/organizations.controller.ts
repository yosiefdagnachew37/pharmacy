import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Organization } from './entities/organization.entity';

@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN) // Only Super Admin can manage tenants
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Get()
    findAll() {
        return this.organizationsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.organizationsService.findOne(id);
    }

    @Get(':id/users')
    findUsers(@Param('id') id: string) {
        return this.organizationsService.findUsers(id);
    }

    @Post()
    create(@Body() data: Partial<Organization>) {
        return this.organizationsService.create(data);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: Partial<Organization>) {
        return this.organizationsService.update(id, data);
    }

    @Patch(':id/status')
    toggleStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
        return this.organizationsService.updateStatus(id, is_active);
    }

    @Patch(':id/suspend')
    suspend(@Param('id') id: string) {
        return this.organizationsService.suspend(id);
    }

    @Patch(':id/activate')
    activate(@Param('id') id: string) {
        return this.organizationsService.activate(id);
    }

    // Subscription management endpoints
    @Patch(':id/subscription')
    updateSubscription(@Param('id') id: string, @Body() data: {
        subscription_plan_name?: string;
        subscription_status?: string;
        subscription_expiry_date?: string;
        extend_days?: number;
    }) {
        return this.organizationsService.updateSubscription(id, data);
    }
}

// Separate controller for non-admin org access (any authenticated user)
import { Controller as Ctrl } from '@nestjs/common';

@Ctrl('organizations')
@UseGuards(JwtAuthGuard)
export class MyOrganizationController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Get('my-org')
    getMyOrg(@Request() req: any) {
        const orgId = req.user?.organizationId;
        if (!orgId) return { name: 'Pharmacy', address: '', phone: '', license_number: '', city: '' };
        return this.organizationsService.findOne(orgId);
    }
}
