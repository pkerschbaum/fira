import { Module, NestModule, MiddlewareConsumer, RequestMethod, Scope } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import * as config from './config';
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
import { MgmtModule } from './mgmt/mgmt.module';
import { IncomingLoggerMiddleware } from './middleware/incoming-logger.middleware';
import { LogExceptionsFilter } from './filter/log-exceptions.filter';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: config.application.staticSourcesPath,
      serveRoot: config.application.urlPaths.web,
      renderPath: `./*`,
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
    MgmtModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: LogExceptionsFilter,
      scope: Scope.REQUEST,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IncomingLoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
