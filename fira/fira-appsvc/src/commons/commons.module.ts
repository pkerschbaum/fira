import { Module, Global, HttpModule } from '@nestjs/common';

import { TransientLogger } from './logger/transient-logger';
import { RequestProperties } from './request-properties';
import { RequestLogger } from './logger/request-logger';
import { AppHttpClient } from './app-http-client';
import { RequestHttpClient } from './request-http-client';

@Global()
@Module({
  imports: [HttpModule],
  providers: [TransientLogger, RequestProperties, RequestLogger, AppHttpClient, RequestHttpClient],
  exports: [TransientLogger, RequestProperties, RequestLogger, AppHttpClient, RequestHttpClient],
})
export class CommonsModule {}
