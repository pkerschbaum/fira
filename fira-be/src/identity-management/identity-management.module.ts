import { Module, HttpModule, HttpService, OnModuleInit } from '@nestjs/common';

import { LoggerModule } from '../logger/app-logger.module';
import { IdentityManagementService } from './identity-management.service';

@Module({
  imports: [HttpModule, LoggerModule],
  providers: [IdentityManagementService],
  exports: [IdentityManagementService],
})
export class IdentityManagementModule {}
