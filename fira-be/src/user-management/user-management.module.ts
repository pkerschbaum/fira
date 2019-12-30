import { Module } from '@nestjs/common';

import { UserManagementController } from './user-management.controller';
import { IdentityManagementModule } from '../identity-management/identity-management.module';

@Module({
  imports: [IdentityManagementModule],
  controllers: [UserManagementController],
})
export class UserManagementModule {}
