import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { getTenantId } from '../../common/utils/tenant-query';
import { tenantStorage } from '../../common/context/tenant.context';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { username, password, role, manager_pin, organization_id } = createUserDto;

        const existingUser = await this.usersRepository.findOne({ 
            where: { username, organization_id } 
        });
        if (existingUser) {
            throw new ConflictException('Username already exists in this organization');
        }

        const salt = await bcrypt.genSalt();
        const password_hash = await bcrypt.hash(password, salt);

        const user = this.usersRepository.create({
            username,
            password_hash,
            role,
            manager_pin,
            organization_id,
        });

        return this.usersRepository.save(user);
    }

    async findOne(username: string, orgName?: string): Promise<User | null> {
        const query = this.usersRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.organization', 'organization')
            .where('user.username = :username', { username });

        if (orgName) {
            query.andWhere('LOWER(organization.name) = LOWER(:orgName)', { orgName });
        }

        return query.getOne();
    }

    async findByUsername(username: string): Promise<User[]> {
        return this.usersRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.organization', 'organization')
            .where('user.username = :username', { username })
            .getMany();
    }

    async findById(id: string): Promise<User | null> {
        // UUIDs are globally unique — no need to filter by tenant
        return this.usersRepository.findOne({ 
            where: { id },
            relations: ['organization']
        });
    }

    async findAll(requestingUser?: User): Promise<User[]> {
        const query = this.usersRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.organization', 'organization');

        const store = tenantStorage.getStore();
        if (requestingUser) {
            const isEffectiveSuperAdmin = store?.isSuperAdmin ?? (requestingUser.role === UserRole.SUPER_ADMIN);
            const effectiveOrgId = store?.organizationId || requestingUser.organization_id;

            if (isEffectiveSuperAdmin) {
                // Real Super Admin (not impersonating) can see everyone.
            } else {
                // REGULAR ADMIN OR IMPERSONATING SUPER ADMIN:
                // Only see users in their organization AND hide SUPER_ADMINS
                query.where('user.organization_id = :orgId', { orgId: effectiveOrgId })
                     .andWhere('user.role != :role', { role: UserRole.SUPER_ADMIN });
            }
        } else {
            // If no user context (e.g. internal), still hide Super Admins from generic lists
            query.where('user.role != :role', { role: UserRole.SUPER_ADMIN });
        }

        return query.getMany();
    }

    async findByOrganization(orgId: string): Promise<User[]> {
        return this.usersRepository.find({
            where: { organization_id: orgId },
            relations: ['organization']
        });
    }

    async update(id: string, updateUserDto: any, requestingUser?: User): Promise<User> {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('User not found');

        // Security Check
        if (requestingUser && requestingUser.role !== UserRole.SUPER_ADMIN) {
            if (user.organization_id !== requestingUser.organization_id) {
                throw new NotFoundException('User not found in your organization');
            }
            if (user.role === UserRole.SUPER_ADMIN) {
                throw new ConflictException('Insufficient permissions');
            }
        }

        const { password, ...rest } = updateUserDto;
        
        if (password) {
            const salt = await bcrypt.genSalt();
            user.password_hash = await bcrypt.hash(password, salt);
        }

        Object.assign(user, rest);
        return this.usersRepository.save(user);
    }

    async remove(id: string, requestingUser?: User): Promise<void> {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException('User not found');

        // Security Check
        if (requestingUser && requestingUser.role !== UserRole.SUPER_ADMIN) {
            if (user.organization_id !== requestingUser.organization_id) {
                throw new NotFoundException('User not found in your organization');
            }
            if (user.role === UserRole.SUPER_ADMIN) {
                throw new ConflictException('Insufficient permissions');
            }
        }

        user.is_active = false;
        await this.usersRepository.save(user);
    }

    async verifyPin(pin: string): Promise<User | null> {
        const organization_id = getTenantId();
        // Find any user with roles ADMIN or PHARMACIST that has this PIN within the current organization
        return this.usersRepository.findOne({
            where: [
                { manager_pin: pin, role: UserRole.ADMIN, is_active: true, organization_id },
                { manager_pin: pin, role: UserRole.PHARMACIST, is_active: true, organization_id }
            ]
        });
    }
}
