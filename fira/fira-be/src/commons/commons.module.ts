import { Module, Global, HttpModule } from '@nestjs/common';

import { BaseLogger } from './logger/base-logger';
import { TransientLogger } from './logger/transient-logger';
import { RequestProperties } from './request-properties';
import { RequestLogger } from './logger/request-logger';
import { AppHttpService } from './http.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [BaseLogger, TransientLogger, RequestProperties, RequestLogger, AppHttpService],
  exports: [BaseLogger, TransientLogger, RequestProperties, RequestLogger, AppHttpService],
})
export class CommonsModule {}
