import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Scope,
} from '@nestjs/common';
import { Connection, MoreThan } from 'typeorm';
import moment = require('moment');
import d3 = require('d3');

import { JudgementsWorkerService, getRotateIndex } from './judgements-worker.service';
import { RequestLogger } from '../commons/request-logger.service';
import { Judgement } from './entity/judgement.entity';
import { User } from '../identity-management/entity/user.entity';
import { Config } from '../admin/entity/config.entity';
import { assertUnreachable } from '../util/types.util';
import { JudgementStatus } from '../typings/enums';
import {
  SaveJudgement,
  PreloadJudgementResponse,
  ExportJudgement,
  Statistic,
} from '../../../commons';

const SERVICE_NAME = 'JudgementsService';

@Injectable({ scope: Scope.REQUEST })
export class JudgementsService {
  constructor(
    private readonly connection: Connection,
    private readonly requestLogger: RequestLogger,
    private readonly judgementsWorkerService: JudgementsWorkerService,
  ) {
    this.requestLogger.setContext(SERVICE_NAME);
  }

  public addPreloadWorklet = async (userId: string): Promise<PreloadJudgementResponse> => {
    this.requestLogger.log(`adding preload worklet for userId=${userId}`);
    return this.judgementsWorkerService.addPreloadWorklet(userId, this.requestLogger);
  };

  public saveJudgement = async (
    userId: string,
    judgementId: number,
    judgementData: SaveJudgement,
  ): Promise<void> => {
    const user = await this.connection.getRepository(User).findOneOrFail(userId);
    const dbJudgement = await this.connection.getRepository(Judgement).findOne({
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
      const rotateIndex = Math.ceil(getRotateIndex(dbJudgement.document.annotateParts.length));
      const rotateIndex2 = Math.floor(getRotateIndex(dbJudgement.document.annotateParts.length));
      relevancePositions = relevancePositions.map((relevancePosition) =>
        relevancePosition >= rotateIndex
          ? relevancePosition - rotateIndex
          : relevancePosition + rotateIndex2,
      );
    }

    if (dbJudgement.status === JudgementStatus.TO_JUDGE) {
      if (
        relevancePositions.length > dbJudgement.document.annotateParts.length ||
        relevancePositions.some(
          (position) => position >= dbJudgement.document.annotateParts.length || position < 0,
        )
      ) {
        this.requestLogger.error(
          `at least one submitted relevance position is out of bound, regarding the size of the document. ` +
            `judgementId=${dbJudgement.id}, documentId=${dbJudgement.document.document.id}, queryId=${dbJudgement.query.query.id}, rotate=${dbJudgement.rotate}, ` +
            `relevancePositions=${JSON.stringify(relevancePositions)}, ` +
            `dbJudgement.document.annotateParts=${JSON.stringify(
              dbJudgement.document.annotateParts,
            )}`,
        );
        throw new BadRequestException(
          `at least one submitted relevance position is out of bound, regarding the size of the document`,
        );
      }

      this.requestLogger.log(
        `open judgement got judged, id=${judgementId}, data=${JSON.stringify(judgementData)}`,
      );

      dbJudgement.status = JudgementStatus.JUDGED;
      dbJudgement.relevanceLevel = judgementData.relevanceLevel;
      if (relevancePositions.length > 0) {
        dbJudgement.relevancePositions = relevancePositions;
      }
      dbJudgement.durationUsedToJudgeMs = judgementData.durationUsedToJudgeMs;
      dbJudgement.judgedAt = new Date();

      await this.connection.getRepository(Judgement).save(dbJudgement);
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
  };

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

  private exportJudgements = async (): Promise<ExportJudgement[]> => {
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

  public getStatistics = async (): Promise<Statistic[]> => {
    this.requestLogger.log('getStatistics');
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
