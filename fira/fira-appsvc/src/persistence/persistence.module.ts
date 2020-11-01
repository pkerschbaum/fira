import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransientLogger } from '../commons/logger/transient-logger';
import { PersistenceService } from './persistence.service';
import { PrismaClient, PrismaClientOptions } from '../../../fira-commons/database/prisma';

import { ConfigDAO } from './config.dao';
import { UserDAO } from './user.dao';
import { DocumentDAO } from './document.dao';
import { DocumentVersionDAO } from './document-version.dao';
import { QueryDAO } from './query.dao';
import { QueryVersionDAO } from './query-version.dao';
import { JudgementsDAO } from './judgements.dao';
import { JudgementPairDAO } from './judgement-pair.dao';
import { FeedbackDAO } from './feedback.dao';

import { Config } from './entity/config.entity';
import { User } from './entity/user.entity';
import { Document, DocumentVersion } from './entity/document.entity';
import { Query, QueryVersion } from './entity/query.entity';
import { Judgement } from './entity/judgement.entity';
import { JudgementPair } from './entity/judgement-pair.entity';
import { Feedback } from './entity/feedback.entity';

let prisma: PrismaClient<PrismaClientOptions, 'info' | 'warn' | 'error'>;
const prismaProvider = {
  provide: PrismaClient,
  inject: [TransientLogger],
  useFactory: (logger: TransientLogger) => {
    if (prisma === undefined) {
      logger.setComponent('PrismaClient');
      prisma = new PrismaClient({
        log: [
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' },
        ],
      });

      // add logging to prisma, see
      // - https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging
      // - https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/middleware#log-the-running-time-of-each-create-query)

      // #1: register log event listeners
      prisma.$on('info', (e) => {
        logger.log(e.message);
      });
      prisma.$on('warn', (e) => {
        logger.warn(e.message);
      });
      prisma.$on('error', (e) => {
        logger.error(e.message);
      });

      // #2: register middleware which logs the execution time of queries
      prisma.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        const durationMs = after - before;
        logger.debug(`Query executed`, {
          model: params.model,
          action: params.action,
          durationMs,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
      });
    }
    return prisma;
  },
};

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Config,
      User,
      Document,
      DocumentVersion,
      Query,
      QueryVersion,
      Judgement,
      JudgementPair,
      Feedback,
    ]),
  ],
  providers: [
    prismaProvider,
    PersistenceService,
    ConfigDAO,
    UserDAO,
    DocumentDAO,
    DocumentVersionDAO,
    QueryDAO,
    QueryVersionDAO,
    JudgementsDAO,
    JudgementPairDAO,
    FeedbackDAO,
  ],
  exports: [
    prismaProvider,
    PersistenceService,
    ConfigDAO,
    UserDAO,
    DocumentDAO,
    DocumentVersionDAO,
    QueryDAO,
    QueryVersionDAO,
    JudgementsDAO,
    JudgementPairDAO,
    FeedbackDAO,
  ],
})
export class PersistenceModule {}
