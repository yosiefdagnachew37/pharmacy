import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LanAuthMiddleware } from './lan-auth.middleware';

/**
 * LanAuthModule — registers LanAuthMiddleware for all routes.
 *
 * The middleware itself is a no-op unless DEPLOYMENT_MODE=lan-server
 * and LAN_SECRET are both set in the environment. This means importing
 * this module has zero runtime effect on SaaS and Desktop builds.
 */
@Module({})
export class LanAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanAuthMiddleware).forRoutes('*');
  }
}
