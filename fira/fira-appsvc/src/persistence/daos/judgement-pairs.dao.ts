import { Injectable } from '@nestjs/common';
import * as Knex from 'knex';

import { TransientLogger } from '../../commons/logger/transient-logger';
import { BaseDAO } from '../base.dao';
import { KnexClient } from '../persistence.constants';
import { transactional } from '../persistence.util';
import { JudgementStatus } from '../../typings/enums';
import { arrays } from '@fira-commons';
import { config, PrismaClient } from '@fira-commons/database/prisma';

type ENTITY = 'judgement_pair';
const ENTITY = 'judgement_pair';

export type PairQueryResult = {
  readonly document_id: string;
  readonly query_id: string;
};

@Injectable()
export class JudgementPairsDAO extends BaseDAO<ENTITY> {
  private readonly cache: {
    availablePriorities?: { countOfPairsWithPrioAll: number; numericPriorities: number[] };
  } = {};

  constructor(prisma: PrismaClient, private readonly logger: TransientLogger) {
    super(ENTITY, prisma);
    this.logger.setComponent(this.constructor.name);
  }

  public getAvailablePriorities = transactional(
    async (
      _,
      trx,
    ): Promise<{
      countOfPairsWithPrioAll: number;
      numericPriorities: number[];
    }> => {
      if (this.cache.availablePriorities === undefined) {
        this.logger.log(`computing and caching available priorities...`);

        const priorities = (await trx(`judgement_pair`).select(`priority`)).map(
          (pair) => pair.priority,
        );

        const countOfPairsWithPrioAll = priorities.filter((p) => p === 'all').length;
        const numericPriorities = arrays
          .uniqueValues(priorities)
          .map((p) => Number(p))
          .filter((p) => !isNaN(p))
          .sort((a, b) => b - a);

        this.cache.availablePriorities = { countOfPairsWithPrioAll, numericPriorities };
      }

      return this.cache.availablePriorities;
    },
  );

  public countTrx = transactional(
    async ({ where }: { where: { user_id: string; status?: JudgementStatus } }, trx) => {
      return Number((await trx(`judgement`).count({ count: '*' }).where(where))[0]?.count ?? 0);
    },
  );

  public findPreloaded = transactional(async ({ where }: { where: { user_id: string } }, trx) => {
    return this.preloaded({ where }, trx)
      .select('document_id', 'query_id')
      .groupBy('document_id', 'query_id');
  });

  public countPreloaded = transactional(
    async ({ where }: { where: { user_id: string; priority: string } }, trx) => {
      return Number((await this.preloaded({ where }, trx).count({ count: '*' }))[0]?.count ?? 0);
    },
  );

  private preloaded = transactional(
    ({ where }: { where: { user_id: string; priority?: string } }, trx) => {
      return trx(`judgement_pair`)
        .whereExists(function () {
          void this.select(trx.raw('1'))
            .from(`judgement`)
            .whereRaw(
              `"judgement"."document_document" = "judgement_pair"."document_id" AND "judgement"."query_query" = "judgement_pair"."query_id"`,
            )
            .andWhere({ user_id: where.user_id });
        })
        .andWhere(where.priority === undefined ? {} : { priority: where.priority });
    },
  );
  public findNotPreloaded = transactional(
    async (
      {
        where,
        limit,
      }: {
        where: { user_id: string; priority?: string };
        limit: number;
      },
      trx,
    ) => {
      return await this.notPreloaded({ where }, trx)
        .select('document_id', 'query_id')
        .groupBy('document_id', 'query_id')
        .orderBy([
          { column: 'document_id', order: 'asc' },
          { column: 'query_id', order: 'asc' },
        ])
        .limit(limit);
    },
  );

  public countNotPreloaded = async (
    { where }: { where: { user_id: string } },
    knexClient: KnexClient | Knex.Transaction,
  ) => {
    return Number(
      (await this.notPreloaded({ where }, knexClient).count({ count: '*' }))[0]?.count ?? 0,
    );
  };

  private notPreloaded = (
    { where }: { where: { user_id: string; priority?: string } },
    knex: KnexClient | Knex.Transaction,
  ) => {
    return knex(`judgement_pair`)
      .whereNotExists(function () {
        void this.select(knex.raw('1'))
          .from(`judgement`)
          .whereRaw(
            `"judgement"."document_document" = "judgement_pair"."document_id" AND "judgement"."query_query" = "judgement_pair"."query_id"`,
          )
          .andWhere({ user_id: where.user_id });
      })
      .andWhere(where.priority === undefined ? {} : { priority: where.priority });
  };

  public getCandidatesByPriority = transactional(
    async (
      {
        where,
        limit,
        dbConfig,
      }: {
        where: { user_id: string };
        limit: number;
        dbConfig: config;
      },
      trx,
    ) => {
      await trx.raw(`LOCK TABLE judgement_pair IN SHARE ROW EXCLUSIVE MODE;`);

      return await trx(`judgement_pair`)
        .select(
          'document_id',
          'query_id',
          trx.raw(
            `cnt_of_judgements / ${dbConfig.annotation_target_per_judg_pair} target_reached_n_times`,
          ),
        )
        .whereNotExists(function () {
          void this.select(trx.raw('1'))
            .from(`judgement`)
            .whereRaw(
              `"judgement"."document_document" = "judgement_pair"."document_id" AND "judgement"."query_query" = "judgement_pair"."query_id"`,
            )
            .andWhere({ user_id: where.user_id });
        })
        .andWhereNot({ priority: 'all' })
        .orderByRaw(
          `target_reached_n_times ASC, "judgement_pair"."priority" DESC, cnt_of_judgements ASC, "judgement_pair"."document_id" ASC, "judgement_pair"."query_id" ASC`,
        )
        .limit(limit);
    },
  );
}
