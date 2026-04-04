import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_FEATURE_KEY } from '../decorators/feature.decorator';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredFeature = this.reflector.getAllAndOverride<string>(REQUIRE_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredFeature) {
      return true; // No specific feature required
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // Super Admins bypass all feature locks
    if (user.role === 'SUPER_ADMIN') {
        return true;
    }

    if (!user.organizationId) {
        throw new ForbiddenException('User lacks organization association');
    }

    // Verify feature using the JWT-injected feature set
    const features = user.subscription_features || [];
    
    // Check if the exact features array includes this feature
    if (!features.includes(requiredFeature)) {
        console.error(`[FEATURE_DENIED] user: ${user.username}, org: ${user.organizationId}, required: ${requiredFeature}, present: ${JSON.stringify(features)}`);
        throw new ForbiddenException(`Your organization's active subscription plan lacks the required feature: ${requiredFeature}`);
    }

    return true;
  }
}
