import { Module, NestModule, MiddlewareConsumer, RequestMethod, Scope } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as config from './config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { JudgementsModule } from './judgements/judgements.module';
import { FeedbackModule } from './feedback/feedback.module';
import { CommonsModule } from './commons/commons.module';
import { PersistenceModule } from './persistence/persistence.module';
import { MgmtModule } from './mgmt/mgmt.module';
import { IncomingLoggerMiddleware } from './commons/incoming-logger.middleware';
import { LogExceptionsFilter } from './filter/log-exceptions.filter';
import { RedirectClientFilter } from './filter/redirect-client.filter';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: config.application.staticSourcesPath,
      serveRoot: config.application.urlPaths.web,
      renderPath: `./*`,
    }),
    AuthModule,
    AdminModule,
    JudgementsModule,
    FeedbackModule,
    CommonsModule,
    PersistenceModule,
    MgmtModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: LogExceptionsFilter,
      scope: Scope.REQUEST,
    },
    {
      provide: APP_FILTER,
      useClass: RedirectClientFilter,
    },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(IncomingLoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
