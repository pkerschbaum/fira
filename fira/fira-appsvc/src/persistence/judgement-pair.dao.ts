import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { TransientLogger } from '../commons/logger/transient-logger';
import { TJudgementPair, JudgementPair, COLUMN_PRIORITY } from './entity/judgement-pair.entity';
import { Judgement } from './entity/judgement.entity';
import { TConfig } from './entity/config.entity';
import { TDocument } from './entity/document.entity';
import { TQuery } from './entity/query.entity';
import { TUser } from './entity/user.entity';
import { optionalTransaction, DAO } from './persistence.util';
import { arrays } from '../../../fira-commons';

export type PairQueryResult = {
  readonly document_id: TDocument['id'];
  readonly query_id: TQuery['id'];
};

export type CountQueryResult = PairQueryResult & {
  readonly count: number;
};

@Injectable()
export class JudgementPairDAO implements DAO<JudgementPair> {
  private readonly cache: {
    availablePriorities?: { countOfPairsWithPrioAll: number; numericPriorities: number[] };
  } = {};
  private readonly logger: TransientLogger;

  constructor(
    @InjectRepository(JudgementPair)
    public readonly repository: Repository<JudgementPair>,
  ) {
    this.logger = new TransientLogger();
    this.logger.setComponent(this.constructor.name);
  }

  public count = async (): Promise<number> => {
    return await this.repository.count();
  };

  public saveJudgementPair = optionalTransaction(JudgementPair)(
    async (
      { data }: { data: Pick<TJudgementPair, 'document' | 'query' | 'priority'> },
      repository,
    ): Promise<void> => {
      const dbEntry = new JudgementPair();
      dbEntry.document = data.document;
      dbEntry.query = data.query;
      dbEntry.priority = data.priority;

      await repository.save(dbEntry);
    },
  );

  public deleteJudgementPairs = optionalTransaction(JudgementPair)(
    async (_, repository): Promise<void> => {
      await repository.delete({});
    },
  );

  public getAvailablePriorities = optionalTransaction(JudgementPair)(
    async (
      _,
      repository,
    ): Promise<{ countOfPairsWithPrioAll: number; numericPriorities: number[] }> => {
      if (this.cache.availablePriorities === undefined) {
        this.logger.log(`computing and caching available priorities...`);

        const priorities = ((await repository
          .createQueryBuilder('judgement_pair')
          .select(`judgement_pair.${COLUMN_PRIORITY}`, 'priority')
          .getRawMany()) as Array<{ priority: TJudgementPair['priority'] | 'all' }>).map(
          (dbObj) => dbObj.priority,
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

  public findPreloaded = optionalTransaction(JudgementPair)(
    async (
      { criteria }: { criteria: { userId: TUser['id'] } },
      _,
      transactionalEM,
    ): Promise<PairQueryResult[]> => {
      return this.preloaded({ criteria }, transactionalEM)
        .select('jp.document_id, jp.query_id')
        .groupBy('jp.document_id, jp.query_id')
        .execute();
    },
  );

  public countPreloaded = optionalTransaction(JudgementPair)(
    async (
      { criteria }: { criteria: { userId: TUser['id']; priority: TJudgementPair['priority'] } },
      _,
      transactionalEM,
    ): Promise<number> => {
      return this.preloaded({ criteria }, transactionalEM)
        .select('jp.*')
        .groupBy('jp.document_id, jp.query_id')
        .getCount();
    },
  );

  private preloaded = optionalTransaction(JudgementPair)(
    (
      { criteria }: { criteria: { userId: TUser['id']; priority?: TJudgementPair['priority'] } },
      repository,
    ): SelectQueryBuilder<JudgementPair> => {
      return repository
        .createQueryBuilder('jp')
        .where((qb) => {
          let subQuery = '';
          if (criteria.priority !== undefined) {
            subQuery += `jp.${COLUMN_PRIORITY} = :priority AND `;
          }
          subQuery += `EXISTS ${qb
            .subQuery()
            .select(`1`)
            .from(Judgement, 'j')
            .where(
              `j.document_document = jp.document_id AND j.query_query = jp.query_id AND j.user_id = :userid`,
            )
            .getQuery()}`;
          return subQuery;
        })
        .setParameter('userid', criteria.userId)
        .setParameter('priority', criteria.priority);
    },
  );

  public findNotPreloaded = optionalTransaction(JudgementPair)(
    async (
      {
        criteria,
        limit,
      }: {
        criteria: { userId: TUser['id']; priority?: TJudgementPair['priority'] };
        limit: number;
      },
      _,
      transactionalEM,
    ): Promise<PairQueryResult[]> => {
      return await this.notPreloaded({ criteria }, transactionalEM)
        .select('jp.document_id, jp.query_id')
        .groupBy('jp.document_id, jp.query_id')
        .orderBy('jp.document_id, jp.query_id', 'ASC')
        .limit(limit)
        .execute();
    },
  );

  public countNotPreloaded = optionalTransaction(JudgementPair)(
    async (
      { criteria }: { criteria: { userId: TUser['id']; priority?: TJudgementPair['priority'] } },
      _,
      transactionalEM,
    ): Promise<number> => {
      return await this.notPreloaded({ criteria }, transactionalEM)
        .select('*')
        .groupBy('jp.document_id, jp.query_id')
        .getCount();
    },
  );

  private notPreloaded = optionalTransaction(JudgementPair)(
    (
      { criteria }: { criteria: { userId: TUser['id']; priority?: TJudgementPair['priority'] } },
      repository,
    ): SelectQueryBuilder<JudgementPair> => {
      return repository
        .createQueryBuilder('jp')
        .where((qb) => {
          let subQuery = '';
          if (criteria.priority !== undefined) {
            subQuery += `jp.${COLUMN_PRIORITY} = :priority AND `;
          }
          subQuery += `NOT EXISTS ${qb
            .subQuery()
            .select(`1`)
            .from(Judgement, 'j')
            .where(
              `j.document_document = jp.document_id AND j.query_query = jp.query_id AND j.user_id = :userid`,
            )
            .getQuery()}`;
          return subQuery;
        })
        .setParameter('userid', criteria.userId)
        .setParameter('priority', criteria.priority);
    },
  );

  public getCandidatesByPriority = optionalTransaction(JudgementPair)(
    async (
      {
        criteria,
        excluding,
        limit,
        targetFactor,
        dbConfig,
      }: {
        criteria: { priority: TJudgementPair['priority'] };
        excluding: { judgementPairs: PairQueryResult[] };
        limit: number;
        targetFactor: number;
        dbConfig: TConfig;
      },
      repository,
    ): Promise<CountQueryResult[]> => {
      return (
        await repository
          .createQueryBuilder('jp')
          .select('jp.document_id, jp.query_id, count(j.*)')
          .leftJoin(
            Judgement,
            'j',
            'j.document_document = jp.document_id AND j.query_query = jp.query_id',
          )
          .where(
            `jp.${COLUMN_PRIORITY} = :priority ${
              excluding.judgementPairs.length === 0
                ? ''
                : `AND (jp.document_id, jp.query_id) NOT IN ( VALUES ` +
                  `${excluding.judgementPairs
                    .map((p) => `('${p.document_id}','${p.query_id}')`)
                    .join(',')} ) `
            }`,
          )
          .setParameter('priority', criteria.priority)
          .groupBy('jp.document_id, jp.query_id')
          .having(`count(j.*) < ${dbConfig.annotationTargetPerJudgPair * targetFactor}`)
          .orderBy('count(j.*), jp.document_id, jp.query_id', 'ASC')
          .limit(limit)
          .execute()
      ).map((pair: CountQueryResult) => ({
        ...pair,
        count: Number(pair.count),
      }));
    },
  );
}
