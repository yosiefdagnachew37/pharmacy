import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('status/health')
    health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @Roles(UserRole.ADMIN) // Only Admin can create users
    create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
        // Automatically assign organization_id if not super admin
        if (req.user.role !== UserRole.SUPER_ADMIN) {
            createUserDto.organization_id = req.user.organization_id;
        }
        return this.usersService.create(createUserDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    @Roles(UserRole.ADMIN)
    findAll(@Req() req: any) {
        return this.usersService.findAll(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateUserDto: any, @Req() req: any) {
        return this.usersService.update(id, updateUserDto, req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string, @Req() req: any) {
        return this.usersService.remove(id, req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify-pin')
    async verifyPin(@Body('pin') pin: string) {
        const user = await this.usersService.verifyPin(pin);
        if (!user) {
            return { valid: false };
        }
        return {
            valid: true,
            userId: user.id,
            username: user.username,
            role: user.role
        };
    }
}
