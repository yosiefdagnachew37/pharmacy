import { Global, Module } from '@nestjs/common';
import { DeploymentConfigService } from './deployment-config.service';

/**
 * GlobalDeploymentModule — provides DeploymentConfigService to the entire application
 * without needing explicit imports in every feature module.
 *
 * Registered in AppModule. Does NOT affect SaaS or Desktop modes.
 */
@Global()
@Module({
  providers: [DeploymentConfigService],
  exports: [DeploymentConfigService],
})
export class DeploymentModule {}
