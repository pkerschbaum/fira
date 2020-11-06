import { Injectable } from '@nestjs/common';
import * as Knex from 'knex';

import * as config from '../config';
import { TransientLogger } from '../commons/logger/transient-logger';
import { RequestLogger } from '../commons/logger/request-logger';
import { PersistenceService } from '../persistence/persistence.service';
import { JudgementsDAO } from '../persistence/daos/judgements.dao';
import { JudgementPairsDAO, PairQueryResult } from '../persistence/daos/judgement-pairs.dao';
import { DocumentVersionsDAO } from '../persistence/daos/document-versions.dao';
import { QueryVersionsDAO } from '../persistence/daos/query-versions.dao';
import { httpUtils } from '../utils/http.utils';
import { JudgementStatus } from '../typings/enums';
import { judgementsSchema, uniqueIdGenerator } from '../../../fira-commons';
import { config as dbConfig, user } from '../../../fira-commons/database/prisma';

type PreloadWorklet = {
  workletId: string;
  user: user;
  responsePromiseExecutor: {
    resolve: () => void;
    reject: (reason?: any) => void;
  };
  logger: TransientLogger | RequestLogger;
};

let singletonGotInstantiated = false;

@Injectable()
export class JudgementsPreloadWorker {
  private preloadQueue: PreloadWorklet[] = [];
  private workerActive = false;
  private readonly appLogger: TransientLogger;

  /* NestJS does not have any mechanism to force a singleton-scope for a service. But the worker must
   * be a singleton in order to have only one worker processing all pending preloads in sequence. Whether
   * a NestJS service is a singleton or not depends on all of its dependencies, the dependencies of those
   * dependencies, etc. If any of the dependencies is not request- or transient-scoped, then this service
   * will also be of that scope. Thus when changing the dependencies of this service, make sure that they
   * are, and stay, singleton-scoped.
   */
  constructor(
    private readonly persistenceService: PersistenceService,
    private readonly judgementsDAO: JudgementsDAO,
    private readonly judgementPairsDAO: JudgementPairsDAO,
    private readonly documentVersionsDAO: DocumentVersionsDAO,
    private readonly queryVersionsDAO: QueryVersionsDAO,
  ) {
    if (singletonGotInstantiated) {
      throw new Error(`this class should be a singleton and thus get instantiated only once`);
    }
    singletonGotInstantiated = true;
    this.appLogger = new TransientLogger();
    this.appLogger.setComponent(this.constructor.name);
  }

  public addPreloadWorklet = (
    user: user,
    logger: TransientLogger | RequestLogger,
  ): { workletId: string; responsePromise: Promise<void> } => {
    logger.log(`adding preload worklet for userId=${user.id}`);

    const workletId = uniqueIdGenerator.generate();
    return {
      workletId,
      responsePromise: new Promise<void>((resolve, reject) => {
        const clonedLogger = logger.clone();
        clonedLogger.setComponent(this.constructor.name);

        this.preloadQueue.push({
          workletId,
          user,
          responsePromiseExecutor: { resolve, reject },
          logger: clonedLogger,
        });

        if (!this.workerActive) {
          this.appLogger.log(`preload worker was paused, resuming...`);
          this.workerActive = true;
          // tslint:disable-next-line: no-floating-promises
          void this.processQueue();
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
        worklet.logger.log(`starting processing preload worklet... userId=${worklet.user.id}`);
        try {
          await this.preloadJudgements(worklet.logger)(worklet);
          worklet.responsePromiseExecutor.resolve();
        } catch (e) {
          worklet.responsePromiseExecutor.reject(e);
        }
      }
    } finally {
      if (this.preloadQueue.length > 0) {
        // continue working on queue
        // tslint:disable-next-line: no-floating-promises
        void this.processQueue();
      } else {
        this.appLogger.log(`no preload worklets left in queue, pausing worker...`);
        this.workerActive = false;
      }
    }
  };

  private preloadJudgements = (requestLogger: TransientLogger | RequestLogger) =>
    this.persistenceService.wrapInTransaction(requestLogger)(
      async (trx, { logger, user }: PreloadWorklet): Promise<void> => {
        const dbConfig = httpUtils.throwIfNullish(await trx(`config`).first());

        const countOfOpenJudgements = await this.judgementPairsDAO.countTrx(
          {
            where: {
              user_id: user.id,
              status: JudgementStatus.TO_JUDGE,
            },
          },
          trx,
        );
        let countJudgementsToPreload =
          config.application.judgementsPreloadSize - countOfOpenJudgements;

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
        } = await this.judgementPairsDAO.getAvailablePriorities({}, trx);

        // if at least one pair with prio "all" exists, check if the user should get some of this
        // pairs as his next pairs preloaded
        if (countOfPairsWithPrioAll > 0) {
          const stepSizeToPreloadPrioAllPair = Math.floor(
            dbConfig.annotation_target_per_user / countOfPairsWithPrioAll,
          );
          const countOfAllJudgements = await this.judgementPairsDAO.countTrx(
            {
              where: { user_id: user.id },
            },
            trx,
          );
          const countPrioAllPairsUserShouldHave = Math.min(
            countOfPairsWithPrioAll,
            Math.floor(
              (countOfAllJudgements + countJudgementsToPreload) / stepSizeToPreloadPrioAllPair,
            ),
          );
          if (countPrioAllPairsUserShouldHave > 0) {
            const countPrioAllPairsUserActuallyHas = await this.judgementPairsDAO.countPreloaded(
              {
                where: {
                  user_id: user.id,
                  priority: 'all',
                },
              },
              trx,
            );

            let countPrioAllPairsMissing =
              countPrioAllPairsUserShouldHave - countPrioAllPairsUserActuallyHas;

            while (countPrioAllPairsMissing > 0 && countJudgementsToPreload > 0) {
              const pairCandidates: PairQueryResult[] = await this.judgementPairsDAO.findNotPreloaded(
                { where: { user_id: user.id, priority: 'all' }, limit: 1 },
                trx,
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
                trx,
                logger,
                [pairsToPersist],
                user,
                dbConfig.judgement_mode as judgementsSchema.JudgementMode,
                dbConfig.rotate_document_text,
              );

              logger.log(`a pair with priority "all" got preloaded`);

              countJudgementsToPreload--;
              countPrioAllPairsMissing--;
            }
          }
        }

        // judgements should get preloaded for this user. Only reason this could not be possible is that
        // the user might have annotated every possible judgement pair already.
        // --> determine how many judgement pairs the user has not annotated so far
        let countRemainingPairsToPreload = await this.judgementPairsDAO.countNotPreloaded(
          { where: { user_id: user.id } },
          trx,
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
        const preloadedPairs = await this.judgementPairsDAO.findPreloaded(
          { where: { user_id: user.id } },
          trx,
        );

        let targetFactor = 1;
        while (countJudgementsToPreload > 0) {
          const countJudgementsGotPreloaded = await this.preloadNextJudgements({
            trx,
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
      },
    );

  private preloadNextJudgements = async ({
    trx,
    logger,
    priorities,
    preloadedPairs,
    targetFactor,
    user,
    countJudgementsToPreload,
    dbConfig,
  }: {
    trx: Knex.Transaction;
    logger: TransientLogger | RequestLogger;
    priorities: number[];
    preloadedPairs: PairQueryResult[];
    targetFactor: number;
    user: user;
    countJudgementsToPreload: number;
    dbConfig: dbConfig;
  }): Promise<number> => {
    let remainingToPreload = countJudgementsToPreload;
    for (const priority of priorities) {
      if (remainingToPreload < 1) {
        // enough open judgements generated
        break;
      }

      const pairCandidates = await this.judgementPairsDAO.getCandidatesByPriority(
        {
          where: { priority: `${priority}` },
          excluding: { judgementPairs: preloadedPairs },
          limit: remainingToPreload,
          targetFactor,
          dbConfig,
        },
        trx,
      );

      if (pairCandidates.length === 0) {
        // all judgement-pairs with the given priority already satisfy the annotation target per
        // judgement-pair, or the user has already judged all the pairs with the given priority
        // --> try next priority
        continue;
      }

      const pairsToPersist = pairCandidates.slice(0, remainingToPreload);
      await this.persistPairs(
        trx,
        logger,
        pairsToPersist,
        user,
        dbConfig.judgement_mode as judgementsSchema.JudgementMode,
        dbConfig.rotate_document_text,
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
    trx: Knex.Transaction,
    logger: TransientLogger | RequestLogger,
    pairs: PairQueryResult[],
    user: user,
    judgementMode: judgementsSchema.JudgementMode,
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
        const rotateStats = await this.judgementsDAO.countJudgementsGroupByRotate({}, trx);
        const countRotate = rotateStats.find((elem) => elem.rotate)?.count ?? 0;
        const countNoRotate = rotateStats.find((elem) => !elem.rotate)?.count ?? 0;
        rotate = countRotate < countNoRotate;
      }

      // gather data and persist judgement
      const dbDocumentVersion = httpUtils.throwIfNullish(
        await this.documentVersionsDAO.findFirst({
          where: { document_id: pair.document_id },
        }),
      );
      const dbQueryVersion = httpUtils.throwIfNullish(
        await this.queryVersionsDAO.findFirst({
          where: { query_id: pair.query_id },
        }),
      );

      logger.log(
        `persisting judgement, documentId=${pair.document_id}, queryId=${pair.query_id}, rotate=${rotate}, mode=${judgementMode}, userId=${user.id}`,
      );

      await this.judgementsDAO.createTrx(
        {
          data: {
            status: JudgementStatus.TO_JUDGE,
            rotate,
            mode: judgementMode,
            document_document: dbDocumentVersion.document_id,
            document_version: dbDocumentVersion.document_version,
            query_query: dbQueryVersion.query_id,
            query_version: dbQueryVersion.query_version,
            user_id: user.id,

            relevance_level: null,
            relevance_positions: [],
            duration_used_to_judge_ms: null,
            judged_at: null,
          },
        },
        trx,
      );
    }
  };
}
