import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Connection, EntityManager, MoreThan } from 'typeorm';
import moment = require('moment');
import d3 = require('d3');

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
  constructor(private readonly connection: Connection, private readonly appLogger: AppLogger) {
    this.appLogger.setContext('JudgementsService');
  }

  public async preloadJudgements(userId: string): Promise<PreloadJudgementResponse> {
    return this.connection.transaction('SERIALIZABLE', async transactionalEntityManager => {
      const user = await transactionalEntityManager.findOneOrFail(User, userId);
      const dbConfig = await transactionalEntityManager.findOneOrFail(Config);
      const judgementsOfUser = await transactionalEntityManager.find(Judgement, {
        where: { user },
      });
      const countOfFeedbacks = await transactionalEntityManager.count(Feedback, {
        where: { user },
      });

      // compute some statistics for this user
      const currentOpenJudgements = judgementsOfUser.filter(
        judgement => judgement.status === JudgementStatus.TO_JUDGE,
      );
      const currentFinishedJudgements = judgementsOfUser.filter(
        judgement => judgement.status === JudgementStatus.JUDGED,
      );

      const remainingToFinish = dbConfig.annotationTargetPerUser - currentFinishedJudgements.length;
      const remainingUntilFirstFeedbackRequired =
        dbConfig.annotationTargetToRequireFeedback - currentFinishedJudgements.length;
      const remainingUntilTargetMet =
        dbConfig.annotationTargetPerUser - judgementsOfUser.length <= 0
          ? 0
          : dbConfig.annotationTargetPerUser - judgementsOfUser.length;
      const maximumToPreload =
        config.application.judgementsPreloadSize - currentOpenJudgements.length;
      let remainingJudgementsToPreload =
        remainingUntilTargetMet > maximumToPreload ? maximumToPreload : remainingUntilTargetMet;

      // the user has to submit feedback if
      // - the annotation target for the first feedback is reached and the user hasn't submitted any feedback
      // - or if the user has reached his annotation target (i.e., has finished his annotations) and
      //   has not submitted a second feedback yet
      const requiredUserAction =
        (remainingUntilFirstFeedbackRequired <= 0 && countOfFeedbacks === 0) ||
        (remainingToFinish <= 0 && countOfFeedbacks <= 1)
          ? UserAnnotationAction.SUBMIT_FEEDBACK
          : UserAnnotationAction.ANNOTATE;

      this.appLogger.log(
        `judgements stats for user: sum=${judgementsOfUser.length}, open=${currentOpenJudgements.length}, ` +
          `finished=${currentFinishedJudgements.length}, remainingUntilTargetMet=${remainingUntilTargetMet}, ` +
          `remainingToPreload=${remainingJudgementsToPreload}, countOfFeedbacks=${countOfFeedbacks}, ` +
          `requiredUserAction=${requiredUserAction}`,
      );

      if (remainingJudgementsToPreload < 1) {
        // either the user has already completed all annotations,
        // or there are enough open judgements for him to satisfy his annotation target,
        // or the preload limit of judgements is met
        // --> do not preload more judgements
        return {
          judgements: mapJudgementsToResponse(currentOpenJudgements),
          alreadyFinished: currentFinishedJudgements.length,
          remainingToFinish,
          requiredUserAction,
        };
      }

      const result: Array<{
        priority: number;
      }> = await transactionalEntityManager
        .createQueryBuilder(JudgementPair, 'judgement_pair')
        .select(`DISTINCT judgement_pair.${COLUMN_PRIORITY}`, 'priority')
        .getRawMany();

      const priorities = result.map(obj => obj.priority).sort((a, b) => b - a); // sort priority descending

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
        targetFactor++;
      }

      const openJudgements = await transactionalEntityManager.find(Judgement, {
        where: { user, status: JudgementStatus.TO_JUDGE },
      });

      return {
        judgements: mapJudgementsToResponse(openJudgements),
        alreadyFinished: currentFinishedJudgements.length,
        remainingToFinish,
        requiredUserAction,
      };
    });
  }

  public async saveJudgement(
    userId: string,
    judgementId: number,
    judgementData: SaveJudgement,
  ): Promise<void> {
    return this.connection.transaction(async transactionalEntityManager => {
      const user = await transactionalEntityManager.findOneOrFail(User, userId);
      const dbJudgement = await transactionalEntityManager.findOne(Judgement, {
        where: { user, id: judgementId },
      });

      if (!dbJudgement) {
        throw new NotFoundException(
          `judgement for the user could not be found! judgemendId=${judgementId}, userId=${userId}`,
        );
      }

      if (dbJudgement.status === JudgementStatus.TO_JUDGE) {
        if (
          judgementData.relevancePositions.length > dbJudgement.document.annotateParts.length ||
          judgementData.relevancePositions.some(
            position => position >= dbJudgement.document.annotateParts.length || position < 0,
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
        if (judgementData.relevancePositions.length > 0) {
          dbJudgement.relevancePositions = judgementData.relevancePositions;
        }
        dbJudgement.durationUsedToJudgeMs = judgementData.durationUsedToJudgeMs;
        dbJudgement.judgedAt = new Date();

        await transactionalEntityManager.save(Judgement, dbJudgement);
      } else if (dbJudgement.status === JudgementStatus.JUDGED) {
        // if all parameters are equal, return status OK, otherwise CONFLICT
        if (
          dbJudgement.relevanceLevel !== judgementData.relevanceLevel ||
          dbJudgement.relevancePositions.length !== judgementData.relevancePositions.length ||
          dbJudgement.relevancePositions.some(
            (position1, index) => judgementData.relevancePositions[index] !== position1,
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
    });
  }

  public exportJudgementsTsv: () => Promise<string> = async () => {
    const judgements = await this.exportJudgements();

    return d3.tsvFormat(
      judgements.map(judgement => {
        // build string for ranges, e.g. '0-4;6-9'
        let relevanceCharacterRanges = '';
        for (const range of judgement.relevanceCharacterRanges) {
          relevanceCharacterRanges += `${range.startChar}-${range.endChar}`;
          relevanceCharacterRanges += ';';
        }
        // remove last semicolon
        relevanceCharacterRanges = relevanceCharacterRanges.substr(
          0,
          relevanceCharacterRanges.length - 1,
        );

        return {
          ...judgement,
          relevanceCharacterRanges,
        };
      }),
    );
  };

  public exportJudgements: () => Promise<ExportJudgement[]> = async () => {
    const allJudgements = await this.connection
      .getRepository(Judgement)
      .find({ where: { status: JudgementStatus.JUDGED } });

    return allJudgements.map(judgement => {
      const partsAvailable = judgement.document.annotateParts;
      const partsAnnotated = judgement.relevancePositions;

      const partsAvailableCharacterRanges = constructCharacterRangesMap(partsAvailable);

      return {
        id: judgement.id,
        relevanceLevel: judgement.relevanceLevel,
        relevanceCharacterRanges: partsAnnotated.map(
          annotated => partsAvailableCharacterRanges[annotated],
        ),
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

  private async preloadNextJudgements({
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
  }): Promise<number> {
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
  }

  public getStatistics: () => Promise<Statistic[]> = async () => {
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
        judgedAt: MoreThan(
          moment()
            .subtract(24, 'hours')
            .toDate(),
        ),
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
      .where(qb => {
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
    const countRotate = rotateStats.find(elem => elem.rotate === true)?.count ?? 0;
    const countNoRotate = rotateStats.find(elem => elem.rotate === false)?.count ?? 0;
    rotate = countRotate < countNoRotate;
  }

  // gather data and persist judgements
  await Promise.all(
    pairs.map(async pair => {
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
    .map(openJudgement => {
      // rotate text (annotation parts), if requested to do so
      let annotationParts = openJudgement.document.annotateParts;
      if (openJudgement.rotate) {
        annotationParts = annotationParts
          .slice(annotationParts.length / 2, annotationParts.length)
          .concat(annotationParts.slice(0, annotationParts.length / 2));
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
