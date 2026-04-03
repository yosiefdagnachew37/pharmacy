import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LicenseService } from './license.service';

@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('status')
  getLicenseStatus() {
    const status = this.licenseService.validateLicense();
    return {
      isValid: status.isValid,
      reason: status.reason,
      hwid: status.hwid
    };
  }

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  applyLicense(@Body() body: { licenseKey: string }) {
    try {
      this.licenseService.applyLicense(body.licenseKey);
      return { success: true, message: 'License applied successfully. Please restart or refresh the application.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
}
