import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';

import { Judgement, JudgementStatus } from './entity/judgement.entity';
import { User } from '../identity-management/entity/user.entity';
import {
  JudgementPair,
  COLUMN_PRIORITY,
} from '../admin/entity/judgement-pair.entity';
import { Document } from '../admin/entity/document.entity';
import { Query } from '../admin/entity/query.entity';
import { Config } from '../admin/entity/config.entity';
import { AppLogger } from '../logger/app-logger.service';
import { assetUtil } from '../admin/asset.util';
import * as config from '../config';

interface PreloadJudgement {
  readonly id: number;
  readonly docAnnotationParts: string[];
  readonly queryText: string;
}

interface CountResult {
  count: number;
  document_id: number;
  priority: number;
  query_id: number;
}

@Injectable()
export class JudgementsService {
  constructor(
    private readonly connection: Connection,
    private readonly appLogger: AppLogger,
  ) {
    this.appLogger.setContext('JudgementsService');
  }
  public async preloadJudgements(userId: string): Promise<PreloadJudgement[]> {
    return this.connection.transaction(async transactionalEntityManager => {
      const user = await transactionalEntityManager.findOneOrFail(User, userId);
      const dbConfig = await transactionalEntityManager.findOneOrFail(Config);
      const judgementsOfUser = await transactionalEntityManager.find(
        Judgement,
        {
          where: { user },
        },
      );
      const currentOpenJudgements = judgementsOfUser.filter(
        judgement => judgement.status === JudgementStatus.TO_JUDGE,
      );

      const remainingAnnotationsForUser =
        dbConfig.annotationTargetPerUser - judgementsOfUser.length;
      let remainingJudgementsToPreload =
        config.application.judgementsPreloadSize - currentOpenJudgements.length;

      this.appLogger.log(
        `judgements stats for user: sum=${judgementsOfUser.length}, open=${currentOpenJudgements.length}, remainingUntilTargetMet=${remainingAnnotationsForUser}, remainingToPreload=${remainingJudgementsToPreload}`,
      );

      if (remainingAnnotationsForUser < 1 || remainingJudgementsToPreload < 1) {
        // either the user has already completed all annotations,
        // or there are enough open judgements for him to satisfy his annotation target,
        // or the preload limit of judgements is met
        // --> do not preload more judgements
        return currentOpenJudgements.map(mapToResponse);
      }

      const result: Array<{
        priority: number;
      }> = await transactionalEntityManager
        .createQueryBuilder(JudgementPair, 'judgement_pair')
        .select(`DISTINCT judgement_pair.${COLUMN_PRIORITY}`, 'priority')
        .getRawMany();

      const priorities = result.map(obj => obj.priority).sort((a, b) => b - a); // sort priority descending

      for (const priority of priorities) {
        if (remainingJudgementsToPreload < 1) {
          // enough open judgements generated
          break;
        }

        const pairCandidates = await computeNextJudgementPairs(
          priority,
          dbConfig,
          transactionalEntityManager,
        );

        if (pairCandidates.length === 0) {
          // all judgement-pairs with the given priority already satisfy the
          // annotation target per judgement-pair --> try next priority
          continue;
        }

        const pairsToPersist = pairCandidates.slice(
          0,
          remainingJudgementsToPreload,
        );
        this.appLogger.log(
          `persisting open judgements, priority=${priority}, pairs=${JSON.stringify(
            pairsToPersist,
          )}`,
        );
        await persistPairs(pairsToPersist, user, transactionalEntityManager);
        remainingJudgementsToPreload -= pairsToPersist.length;
      }

      this.appLogger.log(
        `preload complete, remaining judgements to preload: ${remainingJudgementsToPreload}`,
      );

      const openJudgements = await transactionalEntityManager.find(Judgement, {
        where: { user, status: JudgementStatus.TO_JUDGE },
      });

      return openJudgements.map(mapToResponse);
    });
  }
}

async function computeNextJudgementPairs(
  priority: number,
  dbConfig: Config,
  entityManager: EntityManager,
): Promise<CountResult[]> {
  return (
    await entityManager
      .createQueryBuilder(JudgementPair, 'jp')
      .select('jp.document_id, jp.query_id, count(j.*)')
      .leftJoin(
        Judgement,
        'j',
        'j.document_document = jp.document_id AND j.query_query = jp.query_id',
      )
      .where(`jp.priority = ${priority}`)
      .groupBy('jp.document_id, jp.query_id')
      .execute()
  )
    .map((pair: CountResult) => ({
      ...pair,
      count: Number(pair.count),
    }))
    .filter(
      (pair: CountResult) => pair.count < dbConfig.annotationTargetPerJudgPair,
    )
    .sort((p1: CountResult, p2: CountResult) => p1.count - p2.count);
}

async function persistPairs(
  pairs: CountResult[],
  user: User,
  entityManager: EntityManager,
): Promise<void> {
  // determine whether to set 'rotate text'-flag or not
  const rotateStats: Array<{ rotate: boolean; count: number }> = (
    await entityManager
      .createQueryBuilder(Judgement, 'j')
      .select('j.rotate, count(j.*)')
      .groupBy('j.rotate')
      .execute()
  ).map((elem: { rotate: boolean; count: string }) => ({
    ...elem,
    count: Number(elem.count),
  }));
  const countRotate =
    rotateStats.find(elem => elem.rotate === true)?.count ?? 0;
  const countNoRotate =
    rotateStats.find(elem => elem.rotate === false)?.count ?? 0;
  const rotate = countRotate < countNoRotate;

  // gather data and persist judgements
  await Promise.all(
    pairs.map(async pair => {
      const dbDocument = await entityManager.findOneOrFail(
        Document,
        pair.document_id,
      );
      const dbQuery = await entityManager.findOneOrFail(Query, pair.query_id);
      const dbDocumentVersion = await assetUtil.findCurrentDocumentVersion(
        dbDocument,
        entityManager,
      );
      const dbQueryVersion = await assetUtil.findCurrentQueryVersion(
        dbQuery,
        entityManager,
      );

      const dbJudgement = new Judgement();
      dbJudgement.status = JudgementStatus.TO_JUDGE;
      dbJudgement.rotate = rotate;
      dbJudgement.mode = config.application.judgementMode;
      dbJudgement.document = dbDocumentVersion;
      dbJudgement.query = dbQueryVersion;
      dbJudgement.user = user;

      await entityManager.save(Judgement, dbJudgement);
    }),
  );
}

function mapToResponse(
  openJudgement: Judgement,
): { id: number; queryText: string; docAnnotationParts: string[] } {
  return {
    id: openJudgement.id,
    queryText: openJudgement.query.text,
    docAnnotationParts: openJudgement.document.annotateParts,
  };
}
