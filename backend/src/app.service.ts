import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './modules/users/entities/user.entity';
import { UserRole } from './common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async onApplicationBootstrap() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
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
      });

      await this.userRepository.save(admin);
      console.log('Default admin user created: admin / admin123');
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
