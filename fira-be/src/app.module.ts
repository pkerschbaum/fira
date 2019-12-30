import { Module, HttpModule, HttpService, OnModuleInit } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import nanoid = require('nanoid');

import { LoggerModule } from './logger/app-logger.module';
import { AppLogger } from './logger/app-logger.service';
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user-management/user-management.module';

@Module({
  imports: [HttpModule, LoggerModule, AuthModule, UserManagementModule],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly appLogger: AppLogger,
  ) {
    this.appLogger.setContext('AppModule');
  }

  onModuleInit() {
    registerOutgoingHttpInterceptor(this.httpService.axiosRef, this.appLogger);
  }
}

function registerOutgoingHttpInterceptor(
  axiosInstance: AxiosInstance,
  appLogger: AppLogger,
) {
  axiosInstance.interceptors.request.use(request => {
    try {
      const requestId = nanoid();
      (request as any).requestId = requestId;
      appLogger.log(
        `[REQUEST] [${requestId}] ${request.method?.toUpperCase()} ${
          request.url
        }`,
      );
      if (request.data) {
        appLogger.debug(`[REQUEST PAYLOAD] [${requestId}] ${request.data}`);
      }
    } catch {
      // ignore
    }

    return request;
  });

  axiosInstance.interceptors.response.use(response => {
    try {
      const requestId = (response.config as any).requestId;
      appLogger.log(`[RESPONSE] [${requestId}] ${response.status}`);
      if (response.data) {
        appLogger.debug(
          `[RESPONSE PAYLOAD] [${requestId}] ${JSON.stringify(response.data)}`,
        );
      }
    } catch {
      // ignore
    }

    return response;
  });
}
