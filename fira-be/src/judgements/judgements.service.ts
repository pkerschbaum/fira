import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Connection, EntityManager, MoreThan } from 'typeorm';
import moment = require('moment');
import d3 = require('d3');

import { PersistenceService } from '../persistence/persistence.service';
import {
  PreloadJudgement,
  SaveJudgement,
  CountResult,
  PreloadJudgementResponse,
  ExportJudgement,
} from './judgements.types';
import { JudgementMode, JudgementStatus, UserAnnotationAction } from '../typings/enums';
import { Judgement } from './entity/judgement.entity';
import { User } from '../identity-management/entity/user.entity';
import { JudgementPair, COLUMN_PRIORITY } from '../admin/entity/judgement-pair.entity';
import { Document } from '../admin/entity/document.entity';
import { Query } from '../admin/entity/query.entity';
import { Config } from '../admin/entity/config.entity';
import { Feedback } from '../feedback/entity/feedback.entity';
import { AppLogger } from '../logger/app-logger.service';
import { assetUtil } from '../admin/asset.util';
import { assertUnreachable } from 'src/util/types.util';
import * as config from '../config';
import { Statistic } from '../admin/admin.types';

@Injectable()
export class JudgementsService {
  constructor(
    private readonly connection: Connection,
    private readonly appLogger: AppLogger,
    private readonly persistenceService: PersistenceService,
  ) {
    this.appLogger.setContext('JudgementsService');
  }

  public preloadJudgements = this.persistenceService.wrapInTransaction(
    async (transactionalEntityManager, userId: string): Promise<PreloadJudgementResponse> => {
      const user = await transactionalEntityManager.findOneOrFail(User, userId);
      const dbConfig = await transactionalEntityManager.findOneOrFail(Config);
      const judgementsOfUser = await transactionalEntityManager.find(Judgement, {
        where: { user },
      });
      const countOfFeedbacks = await transactionalEntityManager.count(Feedback, {
        where: { user },
      });
      const countOfTotalJudgementPairs = await transactionalEntityManager.count(JudgementPair);

      // compute some statistics for this user
      const currentOpenJudgements = judgementsOfUser.filter(
        (judgement) => judgement.status === JudgementStatus.TO_JUDGE,
      );
      const currentFinishedJudgements = judgementsOfUser.filter(
        (judgement) => judgement.status === JudgementStatus.JUDGED,
      );

      const remainingToFinish = dbConfig.annotationTargetPerUser - currentFinishedJudgements.length;
      const remainingUntilFirstFeedbackRequired =
        dbConfig.annotationTargetToRequireFeedback - currentFinishedJudgements.length;
      const remainingUntilTargetMet =
        dbConfig.annotationTargetPerUser - judgementsOfUser.length <= 0
          ? 0
          : dbConfig.annotationTargetPerUser - judgementsOfUser.length;
      let remainingJudgementsToPreload =
        config.application.judgementsPreloadSize - currentOpenJudgements.length;
      const annotatedEveryJudgementPair =
        currentFinishedJudgements.length >= countOfTotalJudgementPairs;
      const preloadedEveryJudgementPair = judgementsOfUser.length >= countOfTotalJudgementPairs;

      /*
       * determine next action for the user:
       * - if
       *   - the annotation target for the first feedback is reached and the user hasn't submitted any feedback
       *   - or if the user has reached his annotation target (i.e., has finished his annotations) and
       *     has not submitted a second feedback yet
       *   return FEEDBACK_REQUIRED
       * - otherwise, if the user has annotated every possible judgement pair, return EVERY_PAIR_ANNOTATED
       * - otherwise, if the user has preloaded every possible judgement pair, the user can continue to annotate but
       *   the web client should not preload judgements anymore. To indicate that, return PAIRS_LEFT_TO_ANNOTATE
       * - otherwise, the user can annotate, return PAIRS_LEFT_TO_ANNOTATE
       */
      const nextUserAction =
        (remainingUntilFirstFeedbackRequired <= 0 && countOfFeedbacks === 0) ||
        (remainingToFinish <= 0 && countOfFeedbacks <= 1)
          ? UserAnnotationAction.FEEDBACK_REQUIRED
          : annotatedEveryJudgementPair
          ? UserAnnotationAction.EVERY_PAIR_ANNOTATED
          : preloadedEveryJudgementPair
          ? UserAnnotationAction.PAIRS_LEFT_TO_ANNOTATE
          : UserAnnotationAction.PAIRS_LEFT_TO_PRELOAD;

      this.appLogger.log(
        `judgements stats for user: sum=${judgementsOfUser.length}, open=${currentOpenJudgements.length}, ` +
          `finished=${currentFinishedJudgements.length}, remainingUntilTargetMet=${remainingUntilTargetMet}, ` +
          `remainingToPreload=${remainingJudgementsToPreload}, countOfFeedbacks=${countOfFeedbacks}, ` +
          `nextUserAction=${nextUserAction}`,
      );

      if (
        remainingJudgementsToPreload < 1 ||
        nextUserAction === UserAnnotationAction.EVERY_PAIR_ANNOTATED
      ) {
        // the preload limit of judgements is met, or there are no judgement pairs remaining for this user to annotate
        // --> do not preload more judgements
        return {
          judgements: mapJudgementsToResponse(currentOpenJudgements),
          alreadyFinished: currentFinishedJudgements.length,
          remainingToFinish,
          nextUserAction,
        };
      }

      const result: Array<{
        priority: number;
      }> = await transactionalEntityManager
        .createQueryBuilder(JudgementPair, 'judgement_pair')
        .select(`DISTINCT judgement_pair.${COLUMN_PRIORITY}`, 'priority')
        .getRawMany();

      const priorities = result.map((obj) => obj.priority).sort((a, b) => b - a); // sort priority descending

      let targetFactor = 1;
      while (remainingJudgementsToPreload > 0) {
        remainingJudgementsToPreload = await this.preloadNextJudgements({
          priorities,
          targetFactor,
          userId,
          user,
          remainingJudgementsToPreload,
          dbConfig,
          transactionalEntityManager,
        });

        this.appLogger.log(
          `round of preload complete, annotation target factor was: ${targetFactor}, ` +
            `remaining judgements to preload: ${remainingJudgementsToPreload}`,
        );

        // edge case: if the user now has judgements for EVERY possible judgement pair, stop
        const judgementsOfUser = await transactionalEntityManager.find(Judgement, {
          where: { user },
        });
        const judgementsForEveryPair = judgementsOfUser.length >= countOfTotalJudgementPairs;
        if (judgementsForEveryPair) {
          this.appLogger.log(
            `the user now has judgements for EVERY possible judgement pair --> stop`,
          );
          break;
        }

        targetFactor++;
      }

      const openJudgements = await transactionalEntityManager.find(Judgement, {
        where: { user, status: JudgementStatus.TO_JUDGE },
      });

      return {
        judgements: mapJudgementsToResponse(openJudgements),
        alreadyFinished: currentFinishedJudgements.length,
        remainingToFinish,
        nextUserAction,
      };
    },
  );

  public saveJudgement = this.persistenceService.wrapInTransaction(
    async (
      transactionalEntityManager,
      userId: string,
      judgementId: number,
      judgementData: SaveJudgement,
    ): Promise<void> => {
      const user = await transactionalEntityManager.findOneOrFail(User, userId);
      const dbJudgement = await transactionalEntityManager.findOne(Judgement, {
        where: { user, id: judgementId },
      });

      if (!dbJudgement) {
        throw new NotFoundException(
          `judgement for the user could not be found! judgemendId=${judgementId}, userId=${userId}`,
        );
      }

      // if relevance positions got rotated when sent to the client, then the server has to
      // revert the rotation
      let relevancePositions = judgementData.relevancePositions;
      if (dbJudgement.rotate) {
        const rotateIndex = dbJudgement.document.annotateParts.length / 2;
        relevancePositions = relevancePositions.map((relevancePosition) =>
          relevancePosition >= rotateIndex
            ? relevancePosition - rotateIndex
            : relevancePosition + rotateIndex,
        );
      }

      if (dbJudgement.status === JudgementStatus.TO_JUDGE) {
        if (
          relevancePositions.length > dbJudgement.document.annotateParts.length ||
          relevancePositions.some(
            (position) => position >= dbJudgement.document.annotateParts.length || position < 0,
          )
        ) {
          throw new BadRequestException(
            `at least one submitted relevance position is out of bound, regarding the size of the document`,
          );
        }

        this.appLogger.log(
          `open judgement got judged, id=${judgementId}, data=${JSON.stringify(judgementData)}`,
        );

        dbJudgement.status = JudgementStatus.JUDGED;
        dbJudgement.relevanceLevel = judgementData.relevanceLevel;
        if (relevancePositions.length > 0) {
          dbJudgement.relevancePositions = relevancePositions;
        }
        dbJudgement.durationUsedToJudgeMs = judgementData.durationUsedToJudgeMs;
        dbJudgement.judgedAt = new Date();

        await transactionalEntityManager.save(Judgement, dbJudgement);
      } else if (dbJudgement.status === JudgementStatus.JUDGED) {
        // if all parameters are equal, return status OK, otherwise CONFLICT
        if (
          dbJudgement.relevanceLevel !== judgementData.relevanceLevel ||
          (dbJudgement.relevancePositions === null && relevancePositions.length > 0) ||
          dbJudgement.relevancePositions?.length !== relevancePositions.length ||
          dbJudgement.relevancePositions.some(
            (position1, index) => relevancePositions[index] !== position1,
          ) ||
          dbJudgement.durationUsedToJudgeMs !== judgementData.durationUsedToJudgeMs
        ) {
          throw new ConflictException(
            `judgement with this id got already judged, with different data. judgementId=${judgementId}`,
          );
        }
      } else {
        // exhaustive check
        assertUnreachable(dbJudgement.status);
      }
    },
  );

  public exportJudgementsTsv = async (): Promise<string> => {
    const judgements = await this.exportJudgements();

    return d3.tsvFormat(
      judgements.map((judgement) => {
        // build string for ranges, e.g. '0-4;6-9'
        let relevanceCharacterRanges = '';
        if (judgement.relevanceCharacterRanges.length === 0) {
          relevanceCharacterRanges = '<no ranges selected>';
        } else {
          for (const range of judgement.relevanceCharacterRanges) {
            relevanceCharacterRanges += `${range.startChar}-${range.endChar}`;
            relevanceCharacterRanges += ';';
          }
          // remove last semicolon
          relevanceCharacterRanges = relevanceCharacterRanges.substr(
            0,
            relevanceCharacterRanges.length - 1,
          );
        }

        return {
          ...judgement,
          relevanceCharacterRanges,
        };
      }),
    );
  };

  public exportJudgements = async (): Promise<ExportJudgement[]> => {
    const allJudgements = await this.connection
      .getRepository(Judgement)
      .find({ where: { status: JudgementStatus.JUDGED } });

    return allJudgements.map((judgement) => {
      const partsAvailable = judgement.document.annotateParts;
      const partsAnnotated = judgement.relevancePositions ?? [];

      const partsAvailableCharacterRanges = constructCharacterRangesMap(partsAvailable);
      let relevanceCharacterRanges = partsAnnotated.map(
        (annotated) => partsAvailableCharacterRanges[annotated],
      );

      if (relevanceCharacterRanges.length > 0) {
        // sort ascending by start character
        relevanceCharacterRanges = relevanceCharacterRanges.sort(
          (a, b) => a.startChar - b.startChar,
        );

        // build consecutive ranges
        const consecutiveRanges = [];
        let currentConsecutiveRange = relevanceCharacterRanges[0];
        for (let i = 1; i < relevanceCharacterRanges.length; i++) {
          if (currentConsecutiveRange.endChar + 1 === relevanceCharacterRanges[i].startChar) {
            // consecutive range. just take the end char
            currentConsecutiveRange.endChar = relevanceCharacterRanges[i].endChar;
          } else {
            // no consecutive range. add current consecutive range to result array and
            // proceed with next one
            consecutiveRanges.push(currentConsecutiveRange);
            currentConsecutiveRange = relevanceCharacterRanges[i];
          }
        }
        // add last consecutive range to result
        consecutiveRanges.push(currentConsecutiveRange);

        // take consecutive ranges as result
        relevanceCharacterRanges = consecutiveRanges;
      }

      return {
        id: judgement.id,
        relevanceLevel: judgement.relevanceLevel,
        relevanceCharacterRanges,
        rotate: judgement.rotate,
        mode: judgement.mode,
        durationUsedToJudgeMs: judgement.durationUsedToJudgeMs,
        judgedAtUnixTS: Math.round(judgement.judgedAt.getTime() / 1000),
        documentId: judgement.document.document.id,
        queryId: judgement.query.query.id,
        userId: judgement.user.id,
      };
    });
  };

  private preloadNextJudgements = async ({
    priorities,
    targetFactor,
    userId,
    user,
    remainingJudgementsToPreload,
    dbConfig,
    transactionalEntityManager,
  }: {
    priorities: number[];
    targetFactor: number;
    userId: string;
    user: User;
    remainingJudgementsToPreload: number;
    dbConfig: Config;
    transactionalEntityManager: EntityManager;
  }): Promise<number> => {
    for (const priority of priorities) {
      if (remainingJudgementsToPreload < 1) {
        // enough open judgements generated
        break;
      }

      const pairCandidates = await getCandidatesByPriority(
        priority,
        targetFactor,
        userId,
        dbConfig,
        transactionalEntityManager,
      );

      if (pairCandidates.length === 0) {
        // all judgement-pairs with the given priority already satisfy the annotation target per
        // judgement-pair, or the user already judged all the pairs with the given priority
        // --> try next priority
        continue;
      }

      const pairsToPersist = pairCandidates.slice(0, remainingJudgementsToPreload);
      this.appLogger.log(
        `persisting open judgements, priority=${priority}, pairs=${JSON.stringify(pairsToPersist)}`,
      );
      await persistPairs(
        pairsToPersist,
        user,
        dbConfig.judgementMode,
        dbConfig.rotateDocumentText,
        transactionalEntityManager,
      );
      remainingJudgementsToPreload -= pairsToPersist.length;
    }

    return remainingJudgementsToPreload;
  };

  public getStatistics = async (): Promise<Statistic[]> => {
    const dbConfig = await this.connection.getRepository(Config).findOneOrFail();
    const judgementRepository = this.connection.getRepository(Judgement);

    // count of all judgements with status JUDGED (i.e., completed judgements)
    const countOfAllCompletedJudgements = await judgementRepository
      .createQueryBuilder()
      .where({ status: JudgementStatus.JUDGED })
      .getCount();

    // count of all judgements with status JUDGED (i.e., completed judgements)
    // in the last 24 hours
    const countOfAllCompletedJudgementsLast24Hours = await judgementRepository
      .createQueryBuilder('j')
      .where({
        status: JudgementStatus.JUDGED,
        judgedAt: MoreThan(moment().subtract(24, 'hours').toDate()),
      })
      .getCount();

    // count of users with at least 5 completed judgements
    const countUsersWithAtLeast5ComplJudgements = (
      await judgementRepository
        .createQueryBuilder('j')
        .select(`j.user_id AS user, count(*) AS count`)
        .where({ status: JudgementStatus.JUDGED })
        .groupBy(`j.user_id`)
        .having(`count(*) >= 5`)
        .execute()
    ).length;

    // count of users who reached their annotation targets
    const countUsersTargetReached = (
      await judgementRepository
        .createQueryBuilder('j')
        .select(`j.user_id AS user, count(*) AS count`)
        .where({ status: JudgementStatus.JUDGED })
        .groupBy(`j.user_id`)
        .having(`count(*) >= ${dbConfig.annotationTargetPerUser}`)
        .execute()
    ).length;

    return [
      {
        id: 'countOfAllCompletedJudgements',
        label: 'count of all judgements',
        value: `${countOfAllCompletedJudgements}`,
      },
      {
        id: 'countOfAllCompletedJudgementsLast24Hours',
        label: 'count of all judgements in the last 24 hours',
        value: `${countOfAllCompletedJudgementsLast24Hours}`,
      },
      {
        id: 'countUsersWithAtLeast5ComplJudgements',
        label: 'count of users with at least 5 judgements',
        value: `${countUsersWithAtLeast5ComplJudgements}`,
      },
      {
        id: 'countUsersTargetReached',
        label: 'count of users who reached their annotation targets',
        value: `${countUsersTargetReached}`,
      },
    ];
  };
}

async function getCandidatesByPriority(
  priority: number,
  targetFactor: number,
  userId: string,
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
      .where((qb) => {
        return `jp.priority = ${priority} AND NOT EXISTS ${qb
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
      .execute()
  )
    .map((pair: CountResult) => ({
      ...pair,
      count: Number(pair.count),
    }))
    .filter((pair: CountResult) => pair.count < dbConfig.annotationTargetPerJudgPair * targetFactor)
    .sort((p1: CountResult, p2: CountResult) => p1.count - p2.count);
}

async function persistPairs(
  pairs: CountResult[],
  user: User,
  judgementMode: JudgementMode,
  rotateDocumentText: boolean,
  entityManager: EntityManager,
): Promise<void> {
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

  // gather data and persist judgements
  await Promise.all(
    pairs.map(async (pair) => {
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

      await entityManager.save(Judgement, dbJudgement);
    }),
  );
}

function mapJudgementsToResponse(openJudgements: Judgement[]) {
  return openJudgements
    .map((openJudgement) => {
      // rotate text (annotation parts), if requested to do so
      let annotationParts = openJudgement.document.annotateParts;
      if (openJudgement.rotate) {
        const rotateIndex = annotationParts.length / 2;
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

/**
 * Construct map of character ranges for the given text parts.
 *
 * Example for text "The house":
 * - "textParts" is ["The", " ", "house"]
 * - map of character ranges will then be:
 *  {
 *    0: {startChar: 0, endChar:2},
 *    1: {startChar: 3, endChar:3},
 *    2: {startChar: 4, endChar:8},
 *  }
 */
function constructCharacterRangesMap(textParts: string[]) {
  const partsCharacterRanges: {
    [index: number]: { startChar: number; endChar: number };
  } = {};

  let partOffset = -1;
  textParts.forEach((part, index) => {
    const startChar = partOffset + 1;
    partsCharacterRanges[index] = { startChar, endChar: startChar + part.length - 1 };
    partOffset += part.length;
  });

  return partsCharacterRanges;
}
