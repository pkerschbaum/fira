import { Module } from '@nestjs/common';

import { IdentityManagementService } from './identity-management.service';
import { KeycloakClient } from './keycloak.client';

@Module({
  providers: [IdentityManagementService, KeycloakClient],
  exports: [IdentityManagementService],
})
export class IdentityManagementModule {}
