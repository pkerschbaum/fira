import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { IdentityManagementModule } from '../identity-management/identity-management.module';

@Module({
  imports: [IdentityManagementModule],
  controllers: [AuthController],
})
export class AuthModule {}
