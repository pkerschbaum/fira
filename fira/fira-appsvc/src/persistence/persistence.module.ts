import { Module, Global } from '@nestjs/common';
import * as Knex from 'knex';

import * as config from '../config';
import { TransientLogger } from '../commons/logger/transient-logger';
import { KnexClient, KNEX_CLIENT } from './persistence.constants';
import { PersistenceService } from './persistence.service';
import { PrismaClient, PrismaClientOptions } from '@fira-commons/database/prisma';

import { ConfigsDAO } from './daos/configs.dao';
import { UsersDAO } from './daos/users.dao';
import { DocumentsDAO } from './daos/documents.dao';
import { DocumentVersionsDAO } from './daos/document-versions.dao';
import { QueriesDAO } from './daos/queries.dao';
import { QueryVersionsDAO } from './daos/query-versions.dao';
import { JudgementsDAO } from './daos/judgements.dao';
import { JudgementPairsDAO } from './daos/judgement-pairs.dao';
import { FeedbacksDAO } from './daos/feedbacks.dao';

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

let knexClient: KnexClient;
const knexProvider = {
  provide: KNEX_CLIENT,
  inject: [TransientLogger],
  useFactory: (logger: TransientLogger) => {
    if (knexClient === undefined) {
      logger.setComponent(`KnexClient`);

      knexClient = Knex({
        client: 'pg',
        connection: config.database.connectionString,
        migrations: { directory: './knex-migrations' },
        log: {
          debug: (
            message:
              | { method: string; sql: string; bindings: any[] }
              | Array<{ sql: string; bindings: any[] }>,
          ) => {
            if (Array.isArray(message)) {
              for (const elem of message) {
                logger.debug(`Executing Statement`, {
                  sql: elem.sql,
                  bindings: elem.bindings,
                });
              }
            } else {
              logger.debug(`Executing Statement`, {
                method: message.method,
                sql: message.sql,
                bindings: message.bindings,
              });
            }
          },
          deprecate: (method, alternative) => logger.warn(`deprecated`, { method, alternative }),
          warn: (message) => logger.warn(message),
          error: (message) => logger.error(message),
        },
        debug: process.env.NODE_ENV === 'development',
      });
    }

    return knexClient;
  },
};

export async function initializeDbSchema() {
  await knexClient.migrate.latest();
}

const daos = [
  ConfigsDAO,
  UsersDAO,
  DocumentsDAO,
  DocumentVersionsDAO,
  QueriesDAO,
  QueryVersionsDAO,
  JudgementsDAO,
  JudgementPairsDAO,
  FeedbacksDAO,
];

@Global()
@Module({
  providers: [prismaProvider, knexProvider, PersistenceService, ...daos],
  exports: [prismaProvider, knexProvider, PersistenceService, ...daos],
})
export class PersistenceModule {}
