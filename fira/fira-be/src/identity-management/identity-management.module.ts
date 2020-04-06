import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdentityManagementService } from './identity-management.service';
import { KeycloakClient } from './keycloak.client';
import { User } from './entity/user.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([User])],
  providers: [IdentityManagementService, KeycloakClient],
  exports: [IdentityManagementService],
})
export class IdentityManagementModule {}
