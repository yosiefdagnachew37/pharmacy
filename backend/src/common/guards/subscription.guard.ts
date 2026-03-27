import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../modules/organizations/entities/organization.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // Let AuthGuard handle this
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    if (!user.organizationId) {
      throw new ForbiddenException('User does not belong to any organization.');
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id: user.organizationId },
    });

    if (!organization) {
      throw new ForbiddenException('Organization not found.');
    }

    if (!organization.is_active) {
      throw new ForbiddenException('Organization subscription is inactive or suspended.');
    }

    return true;
  }
}
