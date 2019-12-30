import { Module, HttpModule } from '@nestjs/common';

import { LoggerModule } from '../logger/app-logger.module';
import { IdentityManagementService } from './identity-management.service';
import { KeycloakClient } from './keycloak.client';

@Module({
  imports: [HttpModule, LoggerModule],
  providers: [IdentityManagementService, KeycloakClient],
  exports: [IdentityManagementService],
})
export class IdentityManagementModule {}
