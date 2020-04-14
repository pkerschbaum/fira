import { Injectable, Scope, LoggerService } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import * as config from '../config';
import { PersistenceService } from '../persistence/persistence.service';
import { AppLogger } from '../commons/app-logger.service';
import { User } from '../identity-management/entity/user.entity';
import { Config } from '../admin/entity/config.entity';
import { Judgement } from './entity/judgement.entity';
import { Feedback } from '../feedback/entity/feedback.entity';
import { Document } from '../admin/entity/document.entity';
import { Query } from '../admin/entity/query.entity';
import { JudgementPair, COLUMN_PRIORITY } from '../admin/entity/judgement-pair.entity';
import { PreloadJudgementResponse, JudgementMode, PreloadJudgement } from '../../../commons';
import { JudgementStatus } from '../typings/enums';
import { assetUtil } from '../admin/asset.util';

type PairQueryResult = {
  readonly document_id: string;
  readonly query_id: string;
};

type CountQueryResult = PairQueryResult & {
  readonly count: number;
};

type PreloadWorklet = {
  userId: string;
  responsePromise: {
    resolve: (arg: PreloadJudgementResponse | PromiseLike<PreloadJudgementResponse>) => void;
    reject: (reason?: any) => void;
  };
  logger: LoggerService;
};

const SERVICE_NAME = 'JudgementsWorkerService';

const createLogger = (requestLogger: LoggerService) => ({
  log: (message: any) => {
    requestLogger.log(message, SERVICE_NAME);
  },

  warn: (message: any): void => {
    requestLogger.warn(message, SERVICE_NAME);
  },

  error: (message: any): void => {
    requestLogger.error(message, SERVICE_NAME);
  },
});

@Injectable({ /* singleton scope */ scope: Scope.DEFAULT })
export class JudgementsWorkerService {
  private preloadQueue: PreloadWorklet[] = [];
  private workerActive = false;

  constructor(
    private readonly persistenceService: PersistenceService,
    private readonly appLogger: AppLogger,
  ) {
    this.appLogger.setContext(SERVICE_NAME);
  }

  public addPreloadWorklet = (
    userId: string,
    logger: LoggerService,
  ): Promise<PreloadJudgementResponse> => {
    return new Promise<PreloadJudgementResponse>((resolve, reject) => {
      this.preloadQueue.push({
        userId,
        responsePromise: { resolve, reject },
        logger: createLogger(logger),
      });
      if (!this.workerActive) {
        this.appLogger.log(`preload worker was paused, resuming...`);
        this.workerActive = true;
        this.processQueue();
      }
    });
  };

  private processQueue = (): void => {
    setTimeout(async () => {
      try {
        // get first element of queue
        const worklet = this.preloadQueue.shift();

        if (worklet !== undefined) {
          worklet.logger.log(`starting processing preload worklet... userId=${worklet.userId}`);
          try {
            const result = await this.preloadJudgements(worklet);
            worklet.responsePromise.resolve(result);
          } catch (e) {
            worklet.responsePromise.reject(e);
          }
        }
      } finally {
        if (this.preloadQueue.length > 0) {
          // continue working on queue
          this.processQueue();
        } else {
          this.appLogger.log(`no preload worklets left in queue, pausing worker...`);
          this.workerActive = false;
        }
      }
    }, 0);
  };

  private preloadJudgements = this.persistenceService.wrapInTransaction(
    async (
      transactionalEntityManager,
      worklet: PreloadWorklet,
    ): Promise<PreloadJudgementResponse> => {
      const logger = worklet.logger;

      // preparation: load data needed throughout the entire preload transaction
      const user = await transactionalEntityManager.findOneOrFail(User, worklet.userId);
      const dbConfig = await transactionalEntityManager.findOneOrFail(Config);

      // phase #1: determine how many judgements should, and can, be preloaded for the user,
      // and save preloaded judgements to the database
      await this.preloadAllJudgements({ transactionalEntityManager, logger, user, dbConfig });

      // phase #2: after the user got preloaded as many judgements as possible,
      // load all the data and return it to the client
      const judgementsOfUser = await transactionalEntityManager.find(Judgement, {
        where: { user },
      });
      const countOfFeedbacks = await transactionalEntityManager.count(Feedback, {
        where: { user },
      });
      const countOfNotPreloadedPairs = await getCountOfNotPreloadedPairs(
        transactionalEntityManager,
        user.id,
      );

      // compute some statistics for this user
      const currentOpenJudgements = judgementsOfUser.filter(
        (judgement) => judgement.status === JudgementStatus.TO_JUDGE,
      );
      const countCurrentFinishedJudgements = judgementsOfUser.filter(
        (judgement) => judgement.status === JudgementStatus.JUDGED,
      ).length;

      const remainingToFinish = dbConfig.annotationTargetPerUser - countCurrentFinishedJudgements;
      const remainingUntilFirstFeedbackRequired =
        dbConfig.annotationTargetToRequireFeedback - countCurrentFinishedJudgements;

      logger.log(
        `judgements stats for user: sum of all judgements=${judgementsOfUser.length}, open=${currentOpenJudgements.length}, ` +
          `finished=${countCurrentFinishedJudgements}, countOfFeedbacks=${countOfFeedbacks}, remainingToFinish=${remainingToFinish}, ` +
          `remainingUntilFirstFeedbackRequired=${remainingUntilFirstFeedbackRequired}`,
      );

      return {
        judgements: mapJudgementsToResponse(currentOpenJudgements),
        alreadyFinished: countCurrentFinishedJudgements,
        remainingToFinish,
        remainingUntilFirstFeedbackRequired,
        countOfFeedbacks,
        countOfNotPreloadedPairs,
      };
    },
  );

  private preloadAllJudgements = async ({
    transactionalEntityManager,
    logger,
    user,
    dbConfig,
  }: {
    transactionalEntityManager: EntityManager;
    logger: LoggerService;
    user: User;
    dbConfig: Config;
  }) => {
    const allJudgementsOfUser = await transactionalEntityManager.find(Judgement, {
      where: { user },
    });
    const countOfAllJudgements = allJudgementsOfUser.length;
    const countOfOpenJudgements = allJudgementsOfUser.filter(
      (j) => j.status === JudgementStatus.TO_JUDGE,
    ).length;
    let countJudgementsToPreload = config.application.judgementsPreloadSize - countOfOpenJudgements;

    if (countJudgementsToPreload < 1) {
      logger.log(
        `no judgements should get preloaded for this user, countJudgementsToPreload=${countJudgementsToPreload}`,
      );
      return;
    }

    // judgements should get preloaded for this user. Only reason this could not be possible is that
    // the user might have annotated every possible judgement pair already.
    // --> determine how many judgement pairs the user has not annotated so far
    const countOfNotPreloadedPairs = await getCountOfNotPreloadedPairs(
      transactionalEntityManager,
      user.id,
    );
    if (countOfNotPreloadedPairs < 1) {
      logger.log(
        `there are no judgement pairs left for this user to annotate, ` +
          `countJudgementsToPreload=${countJudgementsToPreload}, countOfNotPreloadedPairs=${countOfNotPreloadedPairs}`,
      );
      return;
    }

    // there is at least one judgement pair left for this user to annotate
    // --> apply preload logic and store preloaded judgements
    logger.log(
      `preloading judgements for this user. ` +
        `countJudgementsToPreload=${countJudgementsToPreload}, countOfNotPreloadedPairs=${countOfNotPreloadedPairs}`,
    );

    // get priorities, extract "all" priority and numeric priorities, and sort the latter descending
    const allPriorities = ((await transactionalEntityManager
      .createQueryBuilder(JudgementPair, 'judgement_pair')
      .select(`DISTINCT judgement_pair.${COLUMN_PRIORITY}`, 'priority')
      .getRawMany()) as Array<{ priority: string | 'all' }>).map((dbObj) => dbObj.priority);

    const priorityAllExists = allPriorities.some((p) => p === 'all');
    const numericPriorities = allPriorities
      .map((p) => Number(p))
      .filter((p) => !isNaN(p))
      .sort((a, b) => b - a);

    if (priorityAllExists) {
      const countOfPairsWithPrioAll = await transactionalEntityManager
        .createQueryBuilder(JudgementPair, 'judgement_pair')
        .where({ priority: 'all' })
        .getCount();
      const stepSizeToPreloadPrioAllPair = Math.floor(
        dbConfig.annotationTargetPerUser / countOfPairsWithPrioAll,
      );
      const countPrioAllPairsUserShouldHave = Math.min(
        countOfPairsWithPrioAll,
        Math.floor(
          (countOfAllJudgements + countJudgementsToPreload) / stepSizeToPreloadPrioAllPair,
        ),
      );
      if (countPrioAllPairsUserShouldHave > 0) {
        const countPrioAllPairsUserActuallyHas = await transactionalEntityManager
          .createQueryBuilder(JudgementPair, 'jp')
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
          .setParameter('userid', user.id)
          .setParameter('priority', 'all')
          .groupBy('jp.document_id, jp.query_id')
          .getCount();

        let countPrioAllPairsMissing =
          countPrioAllPairsUserShouldHave - countPrioAllPairsUserActuallyHas;

        while (countPrioAllPairsMissing > 0 && countJudgementsToPreload > 0) {
          const pairCandidates: PairQueryResult[] = await transactionalEntityManager
            .createQueryBuilder(JudgementPair, 'jp')
            .select('jp.document_id, jp.query_id')
            .where((qb) => {
              return `jp.${COLUMN_PRIORITY} = :priority AND NOT EXISTS ${qb
                .subQuery()
                .select(`1`)
                .from(Judgement, 'j')
                .where(
                  `j.document_document = jp.document_id AND j.query_query = jp.query_id AND j.user_id = :userid`,
                )
                .getQuery()}`;
            })
            .setParameter('userid', user.id)
            .setParameter('priority', 'all')
            .groupBy('jp.document_id, jp.query_id')
            .orderBy('jp.document_id, jp.query_id', 'ASC')
            .execute();

          if (pairCandidates.length < 1) {
            logger.warn(
              `although the user should have got at least one judgement pair with priority=all preloaded, ` +
                `no such judgement pair which the user has not judged yet could be found. ` +
                `countPrioAllPairsUserShouldHave=${countPrioAllPairsUserShouldHave}, countPrioAllPairsUserActuallyHas=${countPrioAllPairsUserActuallyHas}`,
            );
            break;
          }

          const pairsToPersist = pairCandidates[0];

          await this.persistPairs(
            transactionalEntityManager,
            logger,
            [pairsToPersist],
            user,
            dbConfig.judgementMode,
            dbConfig.rotateDocumentText,
          );
          countJudgementsToPreload--;
          countPrioAllPairsMissing--;
        }
      }
    }

    let targetFactor = 1;
    while (countJudgementsToPreload > 0) {
      countJudgementsToPreload = await this.preloadNextJudgements({
        transactionalEntityManager,
        logger,
        priorities: numericPriorities,
        targetFactor,
        user,
        countJudgementsToPreload,
        dbConfig,
      });

      logger.log(
        `round of preload complete, annotation target factor was: ${targetFactor}, ` +
          `remaining judgements to preload: ${countJudgementsToPreload}`,
      );

      // edge case: if the user now has judgements for EVERY possible judgement pair, stop
      const countOfNotPreloadedPairs = await getCountOfNotPreloadedPairs(
        transactionalEntityManager,
        user.id,
      );
      if (countOfNotPreloadedPairs < 1) {
        logger.log(`the user now has judgements for EVERY possible judgement pair --> stop`);
        break;
      }

      targetFactor++;
    }
  };

  private preloadNextJudgements = async ({
    transactionalEntityManager,
    logger,
    priorities,
    targetFactor,
    user,
    countJudgementsToPreload,
    dbConfig,
  }: {
    transactionalEntityManager: EntityManager;
    logger: LoggerService;
    priorities: number[];
    targetFactor: number;
    user: User;
    countJudgementsToPreload: number;
    dbConfig: Config;
  }): Promise<number> => {
    for (const priority of priorities) {
      if (countJudgementsToPreload < 1) {
        // enough open judgements generated
        break;
      }

      const pairCandidates = await getCandidatesByPriority(
        priority,
        targetFactor,
        user.id,
        dbConfig,
        transactionalEntityManager,
      );

      if (pairCandidates.length === 0) {
        // all judgement-pairs with the given priority already satisfy the annotation target per
        // judgement-pair, or the user already judged all the pairs with the given priority
        // --> try next priority
        continue;
      }

      const pairsToPersist = pairCandidates.slice(0, countJudgementsToPreload);
      await this.persistPairs(
        transactionalEntityManager,
        logger,
        pairsToPersist,
        user,
        dbConfig.judgementMode,
        dbConfig.rotateDocumentText,
      );
      countJudgementsToPreload -= pairsToPersist.length;
    }

    return countJudgementsToPreload;
  };

  private persistPairs = async (
    entityManager: EntityManager,
    logger: LoggerService,
    pairs: PairQueryResult[],
    user: User,
    judgementMode: JudgementMode,
    rotateDocumentText: boolean,
  ): Promise<void> => {
    for (const pair of pairs) {
      // determine whether to set 'rotate text'-flag or not
      let rotate: boolean;
      if (!rotateDocumentText) {
        // according to the server config, no rotation should be done
        rotate = false;
      } else {
        // determine how often each variant - rotation or no-rotation - was used,
        // and set the variant which was used less often
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
        const countRotate = rotateStats.find((elem) => elem.rotate === true)?.count ?? 0;
        const countNoRotate = rotateStats.find((elem) => elem.rotate === false)?.count ?? 0;
        rotate = countRotate < countNoRotate;
      }

      // gather data and persist judgement
      const dbDocument = await entityManager.findOneOrFail(Document, pair.document_id);
      const dbQuery = await entityManager.findOneOrFail(Query, pair.query_id);
      const dbDocumentVersion = await assetUtil.findCurrentDocumentVersion(
        dbDocument,
        entityManager,
      );
      const dbQueryVersion = await assetUtil.findCurrentQueryVersion(dbQuery, entityManager);

      const dbJudgement = new Judgement();
      dbJudgement.status = JudgementStatus.TO_JUDGE;
      dbJudgement.rotate = rotate;
      dbJudgement.mode = judgementMode;
      dbJudgement.document = dbDocumentVersion;
      dbJudgement.query = dbQueryVersion;
      dbJudgement.user = user;

      logger.log(
        `persisting judgement, documentId=${dbDocument.id}, queryId=${dbQuery.id}, rotate=${rotate}, mode=${dbJudgement.mode}, userId=${user.id}`,
      );

      await entityManager.save(Judgement, dbJudgement);
    }
  };
}

async function getCountOfNotPreloadedPairs(
  transactionalEntityManager: EntityManager,
  userId: string,
) {
  return await transactionalEntityManager
    .createQueryBuilder(JudgementPair, 'jp')
    .select('jp.*')
    .leftJoin(
      Judgement,
      'j',
      'j.document_document = jp.document_id AND j.query_query = jp.query_id',
    )
    .where((qb) => {
      return `NOT EXISTS ${qb
        .subQuery()
        .select(`1`)
        .from(Judgement, 'j2')
        .where(
          `j2.document_document = j.document_document AND j2.query_query = j.query_query AND j2.user_id = :userid`,
        )
        .getQuery()}`;
    })
    .setParameter('userid', userId)
    .groupBy('jp.document_id, jp.query_id')
    .getCount();
}

async function getCandidatesByPriority(
  priority: number,
  targetFactor: number,
  userId: string,
  dbConfig: Config,
  entityManager: EntityManager,
): Promise<CountQueryResult[]> {
  return (
    await entityManager
      .createQueryBuilder(JudgementPair, 'jp')
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
      .setParameter('userid', userId)
      .setParameter('priority', priority)
      .groupBy('jp.document_id, jp.query_id')
      .orderBy('jp.document_id, jp.query_id', 'ASC')
      .execute()
  )
    .map((pair: CountQueryResult) => ({
      ...pair,
      count: Number(pair.count),
    }))
    .filter(
      (pair: CountQueryResult) => pair.count < dbConfig.annotationTargetPerJudgPair * targetFactor,
    )
    .sort((p1: CountQueryResult, p2: CountQueryResult) => p1.count - p2.count);
}

function mapJudgementsToResponse(openJudgements: Judgement[]) {
  return openJudgements
    .map((openJudgement) => {
      // rotate text (annotation parts), if requested to do so
      let annotationParts = openJudgement.document.annotateParts;
      if (openJudgement.rotate) {
        const rotateIndex = Math.floor(getRotateIndex(annotationParts.length));
        annotationParts = annotationParts
          .slice(rotateIndex, annotationParts.length)
          .concat(annotationParts.slice(0, rotateIndex));
      }

      return {
        id: openJudgement.id,
        queryText: openJudgement.query.text,
        docAnnotationParts: annotationParts,
        mode: openJudgement.mode,
      } as PreloadJudgement;
    })
    .sort((judg1, judg2) => judg1.id - judg2.id);
}

export function getRotateIndex(countOfAnnotationParts: number) {
  return countOfAnnotationParts / 2;
}
