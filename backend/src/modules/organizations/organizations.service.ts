import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private organizationsRepository: Repository<Organization>,
        private usersService: UsersService,
    ) { }

    findAll() {
        return this.organizationsRepository.find();
    }

    async findOne(id: string) {
        const org = await this.organizationsRepository.findOne({ where: { id } });
        if (!org) throw new NotFoundException('Organization not found');
        return org;
    }

    async findUsers(id: string) {
        return this.usersService.findByOrganization(id);
    }

    async create(data: any) {
        const { admin_username, admin_password, ...orgData } = data;
        
        // Use a transaction to ensure both org and user are created or none
        return this.organizationsRepository.manager.transaction(async (manager) => {
            const org = manager.create(Organization, orgData);
            const savedOrg = await manager.save(org);

            if (admin_username && admin_password) {
                await this.usersService.create({
                    username: admin_username,
                    password: admin_password,
                    role: UserRole.ADMIN,
                    organization_id: savedOrg.id,
                });
            }

            return savedOrg;
        });
    }

    async update(id: string, data: Partial<Organization>) {
        await this.organizationsRepository.update(id, data);
        return this.findOne(id);
    }

    async updateStatus(id: string, is_active: boolean) {
        const org = await this.findOne(id);
        org.is_active = is_active;
        return this.organizationsRepository.save(org);
    }

    async suspend(id: string) {
        return this.updateStatus(id, false);
    }

    async activate(id: string) {
        return this.updateStatus(id, true);
    }
}


