import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, SelectQueryBuilder } from 'typeorm';

import { TJudgementPair, JudgementPair, COLUMN_PRIORITY } from './entity/judgement-pair.entity';
import { Judgement } from './entity/judgement.entity';
import { TConfig } from './entity/config.entity';
import { undefinedIfEmpty } from '../util/objects';

export type PairQueryResult = {
  readonly document_id: string;
  readonly query_id: string;
};

export type CountQueryResult = PairQueryResult & {
  readonly count: number;
};

@Injectable()
export class JudgementPairDAO {
  constructor(
    @InjectRepository(JudgementPair)
    private readonly judgementPairRepository: Repository<JudgementPair>,
  ) {}

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

  public getAvailablePriorities = async (transactionalEM?: EntityManager): Promise<string[]> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(JudgementPair)
        : this.judgementPairRepository;

    return ((await repository
      .createQueryBuilder('judgement_pair')
      .select(`DISTINCT judgement_pair.${COLUMN_PRIORITY}`, 'priority')
      .getRawMany()) as Array<{ priority: string | 'all' }>).map((dbObj) => dbObj.priority);
  };

  public countPreloaded = async (
    criteria: { userId: string; priority: string },
    transactionalEM?: EntityManager,
  ): Promise<number> => {
    const repository =
      transactionalEM !== undefined
        ? transactionalEM.getRepository(JudgementPair)
        : this.judgementPairRepository;

    return await repository
      .createQueryBuilder('jp')
      .select('jp.*')
      .where((qb) => {
        return `jp.${COLUMN_PRIORITY} = :priority AND EXISTS ${qb
          .subQuery()
          .select(`1`)
          .from(Judgement, 'j')
          .where(
            `j.document_document = jp.document_id AND j.query_query = jp.query_id AND j.user_id = :userid`,
          )
          .getQuery()}`;
      })
      .setParameter('userid', criteria.userId)
      .setParameter('priority', criteria.priority)
      .groupBy('jp.document_id, jp.query_id')
      .getCount();
  };

  public findNotPreloaded = async (
    criteria: { userId: string; priority?: TJudgementPair['priority'] },
    transactionalEM?: EntityManager,
  ): Promise<PairQueryResult[]> => {
    return await this.notPreloaded(criteria, transactionalEM)
      .orderBy('jp.document_id, jp.query_id', 'ASC')
      .execute();
  };

  public countNotPreloaded = async (
    criteria: { userId: string; priority?: TJudgementPair['priority'] },
    transactionalEM?: EntityManager,
  ): Promise<number> => {
    return await this.notPreloaded(criteria, transactionalEM).getCount();
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
      .select('jp.document_id, jp.query_id')
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
      .setParameter('priority', criteria.priority)
      .groupBy('jp.document_id, jp.query_id');
  };

  public getCandidatesByPriority = async (
    criteria: { userId: string; priority: number },
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
        .where((qb) => {
          return `jp.${COLUMN_PRIORITY} = :priority AND NOT EXISTS ${qb
            .subQuery()
            .select(`1`)
            .from(Judgement, 'j2')
            .where(
              `j2.document_document = j.document_document AND j2.query_query = j.query_query AND j2.user_id = :userid`,
            )
            .getQuery()}`;
        })
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
