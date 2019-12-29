import { Module, HttpModule, HttpService, OnModuleInit } from '@nestjs/common';
import nanoid = require('nanoid');

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { imServiceFactory } from './identity-management/identity-management.service';
import { LoggerModule } from './logger/app-logger.module';
import { AppLogger } from './logger/app-logger.service';

@Module({
  imports: [HttpModule, LoggerModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: imServiceFactory,
      useFactory: imServiceFactory,
      inject: [HttpService, AppLogger],
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly appLogger: AppLogger,
  ) {
    this.appLogger.setContext('AppModule');
  }

  onModuleInit() {
    this.httpService.axiosRef.interceptors.request.use(request => {
      try {
        const requestId = nanoid();
        (request as any).requestId = requestId;
        this.appLogger.log(
          `[REQUEST] [${requestId}] ${request.method?.toUpperCase()} ${
            request.url
          }`,
        );
        if (request.data) {
          this.appLogger.debug(
            `[REQUEST PAYLOAD] [${requestId}] ${request.data}`,
          );
        }
      } catch {
        // ignore
      }

      return request;
    });

    this.httpService.axiosRef.interceptors.response.use(response => {
      try {
        const requestId = (response.config as any).requestId;
        this.appLogger.log(`[RESPONSE] [${requestId}] ${response.status}`);
        if (response.data) {
          this.appLogger.debug(
            `[RESPONSE PAYLOAD] [${requestId}] ${JSON.stringify(response.data)}`,
          );
        }
      } catch {
        // ignore
      }

      return response;
    });
  }
}
