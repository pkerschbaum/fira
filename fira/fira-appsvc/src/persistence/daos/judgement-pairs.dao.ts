import { Injectable } from '@nestjs/common';

import { TransientLogger } from '../../commons/logger/transient-logger';
import { BaseDAO } from '../base.dao';
import { transactional } from '../persistence.util';
import { JudgementStatus } from '../../typings/enums';
import { httpUtils } from '../../utils/http.utils';
import { arrays } from '../../../../fira-commons';
import { config, judgement_pair, PrismaClient } from '../../../../fira-commons/database/prisma';

type ENTITY = 'judgement_pair';
const ENTITY = 'judgement_pair';

export type PairQueryResult = {
  readonly document_id: string;
  readonly query_id: string;
};

export type CountQueryResult = PairQueryResult & {
  readonly count: number;
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
      return httpUtils.throwIfNullish(
        (await trx(`judgement`).where(where).count({ count: '*' }))[0].count,
      );
    },
  );

  public findPreloaded = transactional(async ({ where }: { where: { user_id: string } }, trx) => {
    return this.preloaded({ where }, trx)
      .select('document_id', 'query_id')
      .groupBy('document_id', 'query_id');
  });

  public countPreloaded = transactional(
    async ({ where }: { where: { user_id: string; priority: string } }, trx): Promise<number> => {
      return httpUtils.throwIfNullish(
        await this.preloaded({ where }, trx).groupBy('document_id', 'query_id').count(),
      );
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

  public countNotPreloaded = transactional(
    async ({ where }: { where: { user_id: string; priority?: string } }, trx): Promise<number> => {
      return await this.notPreloaded({ where }, trx).groupBy('document_id', 'query_id').count();
    },
  );

  private notPreloaded = transactional(
    ({ where }: { where: { user_id: string; priority?: string } }, trx) => {
      return trx(`judgement_pair`)
        .whereNotExists(function () {
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

  public getCandidatesByPriority = transactional(
    async (
      {
        where,
        excluding,
        limit,
        targetFactor,
        dbConfig,
      }: {
        where: { priority: string };
        excluding: { judgementPairs: Array<Pick<judgement_pair, 'document_id' | 'query_id'>> };
        limit: number;
        targetFactor: number;
        dbConfig: config;
      },
      trx,
    ): Promise<CountQueryResult[]> => {
      return (
        await trx(`judgement_pair`)
          .select('document_id', 'query_id', trx.raw('count(judgement.*)'))
          .leftJoin(`judgement`, function () {
            this.on(`judgement.document_document`, `=`, `judgement_pair.document_id`).andOn(
              `judgement.query_query`,
              `=`,
              `judgement_pair.query_id`,
            );
          })
          .where({ priority: where.priority })
          .andWhereRaw(
            excluding.judgementPairs.length === 0
              ? 'TRUE = TRUE'
              : `("judgement_pair"."document_id", "judgement_pair"."query_id") NOT IN ( VALUES ` +
                  `${excluding.judgementPairs
                    .map((p) => `('${p.document_id}','${p.query_id}')`)
                    .join(',')} ) `,
          )
          .groupBy('document_id', 'query_id')
          .havingRaw(`count("judgement".*) < ?`, [
            dbConfig.annotation_target_per_judg_pair * targetFactor,
          ])
          .orderByRaw(
            `count("judgement".*), "judgement_pair"."document_id", "judgement_pair"."query_id" ASC`,
          )
          .limit(limit)
      ).map((pair) => ({
        ...pair,
        count: Number((pair as any).count),
      }));
    },
  );
}