import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './modules/users/entities/user.entity';
import { UserRole } from './common/enums/user-role.enum';
import { Organization, SubscriptionPlan } from './modules/organizations/entities/organization.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) { }

  async onApplicationBootstrap() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    // 1. Ensure a platform anchor organization exists
    let platformOrg = await this.organizationRepository.findOne({
      where: { id: '00000000-0000-0000-0000-000000000000' }
    });

    if (!platformOrg) {
      console.log('No platform anchor found. Creating "Platform System HQ"...');
      platformOrg = this.organizationRepository.create({
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Platform System HQ',
        subscription_plan: SubscriptionPlan.GOLD,
        is_active: true,
      });
      await this.organizationRepository.save(platformOrg);
    }

    const adminCount = await this.userRepository.count();
    if (adminCount === 0) {
      console.log('No users found. Creating default admin user...');
      const salt = await bcrypt.genSalt();
      const password_hash = await bcrypt.hash('admin123', salt);

      const admin = this.userRepository.create({
        username: 'admin',
        password_hash,
        role: UserRole.ADMIN,
        is_active: true,
        organization_id: platformOrg.id,
      });

      await this.userRepository.save(admin);
      console.log('Default admin user created: admin / admin123');

      // 2. Also create a Super Admin for platform management
      const superAdminPasswordHash = await bcrypt.hash('superadmin123', salt);
      const superAdmin = this.userRepository.create({
        username: 'superadmin',
        password_hash: superAdminPasswordHash,
        role: UserRole.SUPER_ADMIN,
        is_active: true,
        organization_id: platformOrg.id, // Super admin also needs an org in this schema
      });
      await this.userRepository.save(superAdmin);
      console.log('Default super admin created: superadmin / superadmin123');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
