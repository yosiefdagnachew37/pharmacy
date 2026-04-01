import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_FEATURE_KEY } from '../decorators/require-feature.decorator';
import { SystemFeature } from '../enums/system-feature.enum';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeatures = this.reflector.getAllAndOverride<SystemFeature[]>(REQUIRE_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredFeatures || requiredFeatures.length === 0) {
      return true; // No features required
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Super Admins bypass feature restrictions
    if (user?.role === UserRole.SUPER_ADMIN) return true;

    // Check if user's organization has the required features
    const allowed = user?.allowed_features || [];
    
    // If the endpoint requires multiple features, they must have ALL of them
    const hasAccess = requiredFeatures.every(feature => allowed.includes(feature));

    if (!hasAccess) {
      throw new ForbiddenException(`Your current subscription plan does not include access to these features: ${requiredFeatures.join(', ')}`);
    }

    return true;
  }
}
