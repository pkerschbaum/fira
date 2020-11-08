import { Module } from '@nestjs/common';

import { IdentityManagementModule } from '../identity-management/identity-management.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [IdentityManagementModule],
  controllers: [AuthController],
})
export class AuthModule {}
