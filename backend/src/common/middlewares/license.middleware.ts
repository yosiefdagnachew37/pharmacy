import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LicenseService } from '../security/license.service';

@Injectable()
export class LicenseMiddleware implements NestMiddleware {
  constructor(private readonly licenseService: LicenseService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Allow the license application endpoint to bypass
    if (req.originalUrl.includes('/license/apply') || req.originalUrl.includes('/license/status')) {
      return next();
    }

    // You could also allow login endpoints, but blocking them forces license check immediately 
    // Which is the desired "no start without any authorization" policy.

    const status = this.licenseService.validateLicense();

    if (!status.isValid) {
      return res.status(402).json({
        statusCode: 402,
        message: 'License Required. ' + status.reason,
        hwid: status.hwid,
        error: 'Payment Required'
      });
    }

    next();
  }
}
