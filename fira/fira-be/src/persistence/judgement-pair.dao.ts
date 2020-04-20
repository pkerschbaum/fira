import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, SelectQueryBuilder } from 'typeorm';

import { BaseLogger } from '../commons/logger/base-logger';
import { TJudgementPair, JudgementPair, COLUMN_PRIORITY } from './entity/judgement-pair.entity';
import { Judgement } from './entity/judgement.entity';
import { TConfig } from './entity/config.entity';
import { TDocument } from './entity/document.entity';
import { TQuery } from './entity/query.entity';
import { TUser } from './entity/user.entity';
import * as arrays from '../util/arrays';
import { undefinedIfEmpty } from '../util/objects';

const CONTEXT = 'JudgementPairDAO';

export type PairQueryResult = {
  readonly document_id: TDocument['id'];
  readonly query_id: TQuery['id'];
};

export type CountQueryResult = PairQueryResult & {
  readonly count: number;
};

@Injectable()
export class JudgementPairDAO {
  private readonly cache: {
    availablePriorities?: { countOfPairsWithPrioAll: number; numericPriorities: number[] };
  } = {};
  private readonly baseLogger: BaseLogger;

  constructor(
    @InjectRepository(JudgementPair)
    private readonly judgementPairRepository: Repository<JudgementPair>,
  ) {
    this.baseLogger = new BaseLogger(CONTEXT);
  }

  public count = async (
    criteria?: { priority?: TJudgementPair['priority'] },
    transactionalEM?: EntityManager,
  ): Promise<number> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(JudgementPair)
        : this.judgementPairRepository;

    const findConditions: Partial<TJudgementPair> = {};
    if (criteria?.priority !== undefined) {
      findConditions.priority = criteria.priority;
    }

    return await repository.count({ where: undefinedIfEmpty(findConditions) });
  };

  public saveJudgementPair = async (
    data: Pick<TJudgementPair, 'document' | 'query' | 'priority'>,
    transactionalEM?: EntityManager,
  ): Promise<void> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(JudgementPair)
        : this.judgementPairRepository;

    const dbEntry = new JudgementPair();
    dbEntry.document = data.document;
    dbEntry.query = data.query;
    dbEntry.priority = data.priority;

    await repository.save(dbEntry);
  };

  public deleteJudgementPairs = async (transactionalEM?: EntityManager): Promise<void> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(JudgementPair)
        : this.judgementPairRepository;

    await repository.delete({});
  };

  public getAvailablePriorities = async (
    transactionalEM?: EntityManager,
  ): Promise<{ countOfPairsWithPrioAll: number; numericPriorities: number[] }> => {
    if (this.cache.availablePriorities === undefined) {
      this.baseLogger.log(`computing and caching available priorities...`);

      const repository =
        transactionalEM !== undefined
          ? transactionalEM.getRepository(JudgementPair)
          : this.judgementPairRepository;

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
  };

  public findPreloaded = async (
    criteria: { userId: string },
    transactionalEM?: EntityManager,
  ): Promise<PairQueryResult[]> => {
    return this.preloaded(criteria, transactionalEM)
      .select('jp.document_id, jp.query_id')
      .groupBy('jp.document_id, jp.query_id')
      .execute();
  };

  public countPreloaded = async (
    criteria: { userId: string; priority: string },
    transactionalEM?: EntityManager,
  ): Promise<number> => {
    return this.preloaded(criteria, transactionalEM)
      .select('jp.*')
      .groupBy('jp.document_id, jp.query_id')
      .getCount();
  };

  private preloaded = (
    criteria: { userId: string; priority?: string },
    transactionalEM?: EntityManager,
  ): SelectQueryBuilder<JudgementPair> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(JudgementPair)
        : this.judgementPairRepository;

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
  };

  public findNotPreloaded = async (
    criteria: { userId: string; priority?: TJudgementPair['priority'] },
    transactionalEM?: EntityManager,
  ): Promise<PairQueryResult[]> => {
    return await this.notPreloaded(criteria, transactionalEM)
      .select('jp.document_id, jp.query_id')
      .groupBy('jp.document_id, jp.query_id')
      .orderBy('jp.document_id, jp.query_id', 'ASC')
      .execute();
  };

  public countNotPreloaded = async (
    criteria: { userId: string; priority?: TJudgementPair['priority'] },
    transactionalEM?: EntityManager,
  ): Promise<number> => {
    return await this.notPreloaded(criteria, transactionalEM)
      .select('*')
      .groupBy('jp.document_id, jp.query_id')
      .getCount();
  };

  private notPreloaded = (
    criteria: { userId: string; priority?: TJudgementPair['priority'] },
    transactionalEM?: EntityManager,
  ): SelectQueryBuilder<JudgementPair> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(JudgementPair)
        : this.judgementPairRepository;

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
  };

  public getCandidatesByPriority = async (
    criteria: { userId: TUser['id']; priority: number },
    excluding: { judgementPairs: PairQueryResult[] },
    targetFactor: number,
    dbConfig: TConfig,
    transactionalEM?: EntityManager,
  ): Promise<CountQueryResult[]> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(JudgementPair)
        : this.judgementPairRepository;

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
          `jp.${COLUMN_PRIORITY} = :priority AND (jp.document_id, jp.query_id) NOT IN ( VALUES ` +
            `${excluding.judgementPairs
              .map((p) => `(${p.document_id},${p.query_id})`)
              .join(',')} ) `,
        )
        .setParameter('userid', criteria.userId)
        .setParameter('priority', criteria.priority)
        .groupBy('jp.document_id, jp.query_id')
        .orderBy('jp.document_id, jp.query_id', 'ASC')
        .execute()
    )
      .map((pair: CountQueryResult) => ({
        ...pair,
        count: Number(pair.count),
      }))
      .filter(
        (pair: CountQueryResult) =>
          pair.count < dbConfig.annotationTargetPerJudgPair * targetFactor,
      )
      .sort((p1: CountQueryResult, p2: CountQueryResult) => p1.count - p2.count);
  };
}
