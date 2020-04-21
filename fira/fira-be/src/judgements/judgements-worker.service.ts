import { Injectable, LoggerService } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import * as config from '../config';
import { PersistenceService } from '../persistence/persistence.service';
import { BaseLogger } from '../commons/logger/base-logger';
import { UserDAO } from '../persistence/user.dao';
import { ConfigDAO } from '../persistence/config.dao';
import { DocumentDAO } from '../persistence/document.dao';
import { DocumentVersionDAO } from '../persistence/document-version.dao';
import { QueryDAO } from '../persistence/query.dao';
import { QueryVersionDAO } from '../persistence/query-version.dao';
import { JudgementsDAO } from '../persistence/judgements.dao';
import { JudgementPairDAO, PairQueryResult } from '../persistence/judgement-pair.dao';
import { FeedbackDAO } from '../persistence/feedback.dao';
import { TUser } from '../persistence/entity/user.entity';
import { TConfig } from '../persistence/entity/config.entity';
import { TJudgement } from '../persistence/entity/judgement.entity';
import {
  PreloadJudgementResponse,
  JudgementMode,
  PreloadJudgement,
  uniqueIdGenerator,
} from '../../../commons';
import { JudgementStatus } from '../typings/enums';

type PreloadWorklet = {
  workletId: string;
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

@Injectable()
export class JudgementsWorkerService {
  private preloadQueue: PreloadWorklet[] = [];
  private workerActive = false;
  private readonly appLogger: BaseLogger;

  /* NestJS does not have any mechanism to force a singleton-scope for a service. But the worker must
   * be a singleton in order to have only one worker processing all pending preloads in sequence. Whether
   * a NestJS service is a singleton or not depends on all of its dependencies, the dependencies of those
   * dependencies, etc. If any of the dependencies is not request- or transient-scoped, then this service
   * will also be of that scope. Thus when changing the dependencies of this service, make sure that they
   * are, and stay, singleton-scoped.
   */
  constructor(
    private readonly persistenceService: PersistenceService,
    private readonly userDAO: UserDAO,
    private readonly configDAO: ConfigDAO,
    private readonly documentDAO: DocumentDAO,
    private readonly documentVersionDAO: DocumentVersionDAO,
    private readonly queryDAO: QueryDAO,
    private readonly queryVersionDAO: QueryVersionDAO,
    private readonly judgementsDAO: JudgementsDAO,
    private readonly judgementPairDAO: JudgementPairDAO,
    private readonly feedbackDAO: FeedbackDAO,
  ) {
    this.appLogger = new BaseLogger();
    this.appLogger.setContext(SERVICE_NAME);
  }

  public addPreloadWorklet = (
    userId: string,
    logger: LoggerService,
  ): { workletId: string; responsePromise: Promise<PreloadJudgementResponse> } => {
    const workletId = uniqueIdGenerator.generate();
    return {
      workletId,
      responsePromise: new Promise<PreloadJudgementResponse>((resolve, reject) => {
        this.preloadQueue.push({
          workletId,
          userId,
          responsePromise: { resolve, reject },
          logger: createLogger(logger),
        });
        if (!this.workerActive) {
          this.appLogger.log(`preload worker was paused, resuming...`);
          this.workerActive = true;
          // tslint:disable-next-line: no-floating-promises
          this.processQueue();
        }
      }),
    };
  };

  public removePreloadWorklet = (workletIdToRemove: string): void => {
    this.preloadQueue = this.preloadQueue.filter(
      (worklet) => worklet.workletId !== workletIdToRemove,
    );
  };

  private processQueue = async (): Promise<void> => {
    try {
      // get first element of queue
      const worklet = this.preloadQueue.shift();

      if (worklet !== undefined) {
        worklet.logger.log(`starting processing preload worklet... userId=${worklet.userId}`);
        try {
          const result = await this.preloadJudgements(worklet.logger)(worklet);
          worklet.responsePromise.resolve(result);
        } catch (e) {
          worklet.responsePromise.reject(e);
        }
      }
    } finally {
      if (this.preloadQueue.length > 0) {
        // continue working on queue
        // tslint:disable-next-line: no-floating-promises
        this.processQueue();
      } else {
        this.appLogger.log(`no preload worklets left in queue, pausing worker...`);
        this.workerActive = false;
      }
    }
  };

  private preloadJudgements = (requestLogger: LoggerService) =>
    this.persistenceService.wrapInTransaction(requestLogger)(
      async (
        transactionalEntityManager,
        worklet: PreloadWorklet,
      ): Promise<PreloadJudgementResponse> => {
        const logger = worklet.logger;

        // preparation: load data needed throughout the entire preload transaction
        const user = await this.userDAO.findUserOrFail(
          { criteria: { id: worklet.userId } },
          transactionalEntityManager,
        );
        const dbConfig = await this.configDAO.findConfigOrFail(transactionalEntityManager);

        // phase #1: determine how many judgements should, and can, be preloaded for the user,
        // and save preloaded judgements to the database
        await this.preloadAllJudgements({ transactionalEntityManager, logger, user, dbConfig });

        // phase #2: after the user got preloaded as many judgements as possible,
        // load all the data and return it to the client
        const countOfFeedbacks = await this.feedbackDAO.count(
          { criteria: { user } },
          transactionalEntityManager,
        );
        const countOfNotPreloadedPairs = await this.judgementPairDAO.countNotPreloaded(
          { criteria: { userId: user.id } },
          transactionalEntityManager,
        );
        const currentOpenJudgements = await this.judgementsDAO.findJudgements(
          { criteria: { user, status: JudgementStatus.TO_JUDGE } },
          transactionalEntityManager,
        );
        const countCurrentFinishedJudgements = await this.judgementsDAO.countJudgements(
          { criteria: { user, status: JudgementStatus.JUDGED } },
          transactionalEntityManager,
        );

        const remainingToFinish = dbConfig.annotationTargetPerUser - countCurrentFinishedJudgements;
        const remainingUntilFirstFeedbackRequired =
          dbConfig.annotationTargetToRequireFeedback - countCurrentFinishedJudgements;

        logger.log(
          `judgements stats for user: open=${currentOpenJudgements.length}, finished=${countCurrentFinishedJudgements}, ` +
            `countOfFeedbacks=${countOfFeedbacks}, remainingToFinish=${remainingToFinish}, ` +
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
    user: TUser;
    dbConfig: TConfig;
  }): Promise<void> => {
    const countOfOpenJudgements = await this.judgementsDAO.countJudgements(
      { criteria: { user, status: JudgementStatus.TO_JUDGE } },
      transactionalEntityManager,
    );
    let countJudgementsToPreload = config.application.judgementsPreloadSize - countOfOpenJudgements;

    if (countJudgementsToPreload < 1) {
      logger.log(
        `no judgements should get preloaded for this user, countJudgementsToPreload=${countJudgementsToPreload}`,
      );
      return;
    }

    // there is at least one judgement pair left for this user to annotate
    // --> apply preload logic and store preloaded judgements
    logger.log(
      `preloading judgements for this user... countJudgementsToPreload=${countJudgementsToPreload}`,
    );

    // get available priorities
    const {
      countOfPairsWithPrioAll,
      numericPriorities,
    } = await this.judgementPairDAO.getAvailablePriorities(transactionalEntityManager);

    // if at least one pair with prio "all" exists, check if the user should get some of this
    // pairs as his next pairs preloaded
    if (countOfPairsWithPrioAll > 0) {
      const stepSizeToPreloadPrioAllPair = Math.floor(
        dbConfig.annotationTargetPerUser / countOfPairsWithPrioAll,
      );
      const countOfAllJudgements = await this.judgementsDAO.countJudgements(
        { criteria: { user } },
        transactionalEntityManager,
      );
      const countPrioAllPairsUserShouldHave = Math.min(
        countOfPairsWithPrioAll,
        Math.floor(
          (countOfAllJudgements + countJudgementsToPreload) / stepSizeToPreloadPrioAllPair,
        ),
      );
      if (countPrioAllPairsUserShouldHave > 0) {
        const countPrioAllPairsUserActuallyHas = await this.judgementPairDAO.countPreloaded({
          criteria: {
            userId: user.id,
            priority: 'all',
          },
        });

        let countPrioAllPairsMissing =
          countPrioAllPairsUserShouldHave - countPrioAllPairsUserActuallyHas;

        while (countPrioAllPairsMissing > 0 && countJudgementsToPreload > 0) {
          const pairCandidates: PairQueryResult[] = await this.judgementPairDAO.findNotPreloaded(
            { criteria: { userId: user.id, priority: 'all' } },
            transactionalEntityManager,
          );

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

    // judgements should get preloaded for this user. Only reason this could not be possible is that
    // the user might have annotated every possible judgement pair already.
    // --> determine how many judgement pairs the user has not annotated so far
    let countRemainingPairsToPreload = await this.judgementPairDAO.countNotPreloaded(
      { criteria: { userId: user.id } },
      transactionalEntityManager,
    );
    if (countRemainingPairsToPreload < 1) {
      logger.log(
        `there are no judgement pairs left for this user to annotate, ` +
          `countJudgementsToPreload=${countJudgementsToPreload}, countRemainingPairsToPreload=${countRemainingPairsToPreload}`,
      );
      return;
    }

    // query preloaded pairs once and update the list on-the-fly while searching for
    // the right judgement pair candidates (because the query is quite expensive)
    const preloadedPairs = await this.judgementPairDAO.findPreloaded(
      { criteria: { userId: user.id } },
      transactionalEntityManager,
    );

    let targetFactor = 1;
    while (countJudgementsToPreload > 0) {
      const countJudgementsGotPreloaded = await this.preloadNextJudgements({
        transactionalEntityManager,
        logger,
        priorities: numericPriorities,
        preloadedPairs,
        targetFactor,
        user,
        countJudgementsToPreload,
        dbConfig,
      });

      logger.log(
        `round of preload complete, annotation target factor was: ${targetFactor}, ` +
          `count judgements got preloaded: ${countJudgementsGotPreloaded}`,
      );

      countRemainingPairsToPreload -= countJudgementsGotPreloaded;
      countJudgementsToPreload -= countJudgementsGotPreloaded;
      targetFactor++;

      // edge case: if the user now has judgements for EVERY possible judgement pair, stop
      if (countRemainingPairsToPreload < 1) {
        logger.log(`the user now has judgements for EVERY possible judgement pair --> stop`);
        break;
      }
    }
  };

  private preloadNextJudgements = async ({
    transactionalEntityManager,
    logger,
    priorities,
    preloadedPairs,
    targetFactor,
    user,
    countJudgementsToPreload,
    dbConfig,
  }: {
    transactionalEntityManager: EntityManager;
    logger: LoggerService;
    priorities: number[];
    preloadedPairs: PairQueryResult[];
    targetFactor: number;
    user: TUser;
    countJudgementsToPreload: number;
    dbConfig: TConfig;
  }): Promise<number> => {
    let remainingToPreload = countJudgementsToPreload;
    for (const priority of priorities) {
      if (remainingToPreload < 1) {
        // enough open judgements generated
        break;
      }

      const pairCandidates = await this.judgementPairDAO.getCandidatesByPriority(
        {
          criteria: { userId: user.id, priority },
          excluding: { judgementPairs: preloadedPairs },
          targetFactor,
          dbConfig,
        },
        transactionalEntityManager,
      );

      if (pairCandidates.length === 0) {
        // all judgement-pairs with the given priority already satisfy the annotation target per
        // judgement-pair, or the user already judged all the pairs with the given priority
        // --> try next priority
        continue;
      }

      const pairsToPersist = pairCandidates.slice(0, remainingToPreload);
      await this.persistPairs(
        transactionalEntityManager,
        logger,
        pairsToPersist,
        user,
        dbConfig.judgementMode,
        dbConfig.rotateDocumentText,
      );

      // after the pairs got persisted, add them to the list of preloaded pairs
      for (const persistedPair of pairsToPersist) {
        preloadedPairs.push(persistedPair);
      }
      remainingToPreload -= pairsToPersist.length;
    }

    const countJudgementsGotPreloaded = countJudgementsToPreload - remainingToPreload;
    return countJudgementsGotPreloaded;
  };

  private persistPairs = async (
    entityManager: EntityManager,
    logger: LoggerService,
    pairs: PairQueryResult[],
    user: TUser,
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
        const rotateStats = await this.judgementsDAO.countJudgementsGroupByRotate(entityManager);
        const countRotate = rotateStats.find((elem) => elem.rotate === true)?.count ?? 0;
        const countNoRotate = rotateStats.find((elem) => elem.rotate === false)?.count ?? 0;
        rotate = countRotate < countNoRotate;
      }

      // gather data and persist judgement
      const dbDocument = await this.documentDAO.findDocumentOrFail(
        { criteria: { id: pair.document_id } },
        entityManager,
      );
      const dbQuery = await this.queryDAO.findQueryOrFail(
        { criteria: { id: pair.query_id } },
        entityManager,
      );
      const dbDocumentVersion = await this.documentVersionDAO.findCurrentDocumentVersion(
        { criteria: { dbDocument } },
        entityManager,
      );
      const dbQueryVersion = await this.queryVersionDAO.findCurrentQueryVersion(
        { criteria: { dbQuery } },
        entityManager,
      );

      logger.log(
        `persisting judgement, documentId=${dbDocument.id}, queryId=${dbQuery.id}, rotate=${rotate}, mode=${judgementMode}, userId=${user.id}`,
      );

      await this.judgementsDAO.saveJudgement(
        {
          data: {
            status: JudgementStatus.TO_JUDGE,
            rotate,
            mode: judgementMode,
            document: dbDocumentVersion,
            query: dbQueryVersion,
            user,
          },
        },
        entityManager,
      );
    }
  };
}

function mapJudgementsToResponse(openJudgements: TJudgement[]) {
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
