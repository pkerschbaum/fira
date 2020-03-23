import { Module, HttpModule, HttpService, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AxiosInstance } from 'axios';
import nanoid = require('nanoid');
import * as path from 'path';

import { LoggerModule } from './logger/app-logger.module';
import { AppLogger } from './logger/app-logger.service';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { User } from './identity-management/entity/user.entity';
import { Document, DocumentVersion } from './admin/entity/document.entity';
import { Query, QueryVersion } from './admin/entity/query.entity';
import { Config } from './admin/entity/config.entity';
import { Judgement } from './judgements/entity/judgement.entity';
import { JudgementPair } from './admin/entity/judgement-pair.entity';
import { Feedback } from './feedback/entity/feedback.entity';
import { JudgementsModule } from './judgements/judgements.module';
import { FeedbackModule } from './feedback/feedback.module';
import { PersistenceModule } from './persistence/persistence.module';
import * as config from './config';

@Module({
  imports: [
    HttpModule,
    LoggerModule,
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'client', 'build'),
      renderPath: '/*',
    }),
    TypeOrmModule.forRoot({
      ...config.database,
      entities: [
        User,
        Document,
        DocumentVersion,
        Query,
        QueryVersion,
        JudgementPair,
        Config,
        Judgement,
        Feedback,
      ],
    }),
    AuthModule,
    AdminModule,
    JudgementsModule,
    FeedbackModule,
    PersistenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly httpService: HttpService, private readonly appLogger: AppLogger) {
    this.appLogger.setContext('AppModule');
  }

  onModuleInit() {
    registerOutgoingHttpInterceptor(this.httpService.axiosRef, this.appLogger);
  }
}

function registerOutgoingHttpInterceptor(axiosInstance: AxiosInstance, appLogger: AppLogger) {
  axiosInstance.interceptors.request.use((request) => {
    try {
      const requestId = nanoid();
      (request as any).requestId = requestId;
      appLogger.log(`[REQUEST] [${requestId}] ${request.method?.toUpperCase()} ${request.url}`);
      if (request.data) {
        appLogger.debug(`[REQUEST PAYLOAD] [${requestId}] ${JSON.stringify(request.data)}`);
      }
    } catch {
      // ignore
    }

    return request;
  });

  axiosInstance.interceptors.response.use((response) => {
    try {
      const requestId = (response.config as any).requestId;
      appLogger.log(`[RESPONSE] [${requestId}] ${response.status}`);
      if (response.data) {
        appLogger.debug(`[RESPONSE PAYLOAD] [${requestId}] ${JSON.stringify(response.data)}`);
      }
    } catch {
      // ignore
    }

    return response;
  });
}
