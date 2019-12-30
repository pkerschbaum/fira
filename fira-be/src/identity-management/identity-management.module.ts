import { Module, HttpModule, HttpService, OnModuleInit } from '@nestjs/common';

import * as imService from './identity-management.service';
import { LoggerModule } from '../logger/app-logger.module';
import { AppLogger } from '../logger/app-logger.service';

@Module({
  imports: [HttpModule, LoggerModule],
  providers: [
    {
      provide: imService.SERVICE_TOKEN,
      useFactory: imService.imServiceFactory,
      inject: [HttpService, AppLogger],
    },
  ],
  exports: [imService.SERVICE_TOKEN],
})
export class IdentityManagementModule {}
