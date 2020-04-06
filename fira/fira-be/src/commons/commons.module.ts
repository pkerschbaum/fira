import { Module, Global, HttpModule } from '@nestjs/common';
import { AppLogger } from './app-logger.service';
import { RequestProperties } from './request-properties.service';
import { RequestLogger } from './request-logger.service';
import { AppHttpService } from './http.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [AppLogger, RequestProperties, RequestLogger, AppHttpService],
  exports: [AppLogger, RequestProperties, RequestLogger, AppHttpService],
})
export class CommonsModule {}
