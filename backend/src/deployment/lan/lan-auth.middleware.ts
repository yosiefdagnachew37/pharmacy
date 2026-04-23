import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * LanAuthMiddleware — shared-secret token validation for LAN server mode.
 *
 * Only active when:
 *   DEPLOYMENT_MODE=lan-server AND LAN_SECRET env var is set.
 *
 * Otherwise this middleware is a complete no-op and does not affect
 * SaaS or Desktop modes in any way.
 *
 * Client PCs must include the header:
 *   x-lan-secret: <your-shared-secret>
 *
 * Endpoints that are always exempt:
 *   - /license/status
 *   - /license/apply
 *   - /users/status/health
 */
@Injectable()
export class LanAuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LanAuthMiddleware.name);

  /** Whether LAN auth enforcement is active (computed once at startup) */
  private readonly isActive: boolean;
  private readonly expectedSecret: string;

  /** Endpoints always allowed without a LAN secret (bootstrap/health) */
  private static readonly BYPASS_PATHS = [
    '/license/status',
    '/license/apply',
    '/users/status/health',
  ];

  constructor() {
    const mode = process.env.DEPLOYMENT_MODE;
    const secret = process.env.LAN_SECRET;

    this.isActive = mode === 'lan-server' && !!secret;
    this.expectedSecret = secret ?? '';

    if (this.isActive) {
      this.logger.log('[LAN Auth] LAN secret authentication is ENABLED.');
    } else if (mode === 'lan-server' && !secret) {
      this.logger.warn(
        '[LAN Auth] Running as lan-server but LAN_SECRET is not set. ' +
          'All requests will be allowed — set LAN_SECRET in your environment for security.',
      );
    }
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // No-op for SaaS / Desktop / dev — zero overhead
    if (!this.isActive) {
      return next();
    }

    // Always allow bootstrap/health endpoints
    const url = req.originalUrl.split('?')[0];
    if (LanAuthMiddleware.BYPASS_PATHS.some((p) => url.includes(p))) {
      return next();
    }

    // Validate the shared secret header
    const providedSecret = req.headers['x-lan-secret'];
    if (!providedSecret || providedSecret !== this.expectedSecret) {
      this.logger.warn(
        `[LAN Auth] Unauthorized request blocked: ${req.method} ${url} from ${req.ip}`,
      );
      res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'LAN secret token is missing or invalid.',
      });
      return;
    }

    next();
  }
}
