import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/app-logger.module';
import { IdentityManagementService } from './identity-management.service';
import { KeycloakClient } from './keycloak.client';
import { User } from './user/user.entity';

@Module({
  imports: [HttpModule, LoggerModule, TypeOrmModule.forFeature([User])],
  providers: [IdentityManagementService, KeycloakClient],
  exports: [IdentityManagementService],
})
export class IdentityManagementModule {}
