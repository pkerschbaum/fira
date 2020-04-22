import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Scope,
} from '@nestjs/common';
import moment = require('moment');
import d3 = require('d3');

import * as config from '../config';
import { RequestLogger } from '../commons/logger/request-logger';
import { JudgementsWorkerService } from './judgements-worker.service';
import { PersistenceService } from '../persistence/persistence.service';
import { JudgementsDAO } from '../persistence/judgements.dao';
import { JudgementPairDAO } from '../persistence/judgement-pair.dao';
import { UserDAO } from '../persistence/user.dao';
import { ConfigDAO } from '../persistence/config.dao';
import { FeedbackDAO } from '../persistence/feedback.dao';
import { TJudgement } from '../persistence/entity/judgement.entity';
import { assertUnreachable } from '../util/types.util';
import { JudgementStatus } from '../typings/enums';
import {
  SaveJudgement,
  PreloadJudgementResponse,
  ExportJudgement,
  Statistic,
  PreloadJudgement,
} from '../../../commons';

const SERVICE_NAME = 'JudgementsService';

@Injectable({ scope: Scope.REQUEST })
export class JudgementsService {
  constructor(
    private readonly requestLogger: RequestLogger,
    private readonly judgementsWorkerService: JudgementsWorkerService,
    private readonly persistenceService: PersistenceService,
    private readonly judgementsDAO: JudgementsDAO,
    private readonly judgementPairDAO: JudgementPairDAO,
    private readonly userDAO: UserDAO,
    private readonly configDAO: ConfigDAO,
    private readonly feedbackDAO: FeedbackDAO,
  ) {
    this.requestLogger.setContext(SERVICE_NAME);
  }

  public preload = async (
    userId: string,
  ): Promise<{ workletId?: string; responsePromise: Promise<PreloadJudgementResponse> }> => {
    const user = await this.userDAO.findUserOrFail({ criteria: { id: userId } });

    // phase #1: determine how many judgements should, and can, be preloaded for the user.
    // if some should get preloaded, add a worklet to the worker and wait for it to get processed
    const countOfOpenJudgements = await this.judgementsDAO.countJudgements({
      criteria: { user, status: JudgementStatus.TO_JUDGE },
    });
    const countJudgementsToPreload =
      config.application.judgementsPreloadSize - countOfOpenJudgements;

    let workletPromise = Promise.resolve();
    let workletId: string | undefined;
    if (countJudgementsToPreload < 1) {
      this.requestLogger.log(
        `no judgements should get preloaded for this user, userId=${user.id}, countJudgementsToPreload=${countJudgementsToPreload}`,
      );
    } else {
      const worklet = this.judgementsWorkerService.addPreloadWorklet(user, this.requestLogger);
      workletPromise = worklet.responsePromise;
      workletId = worklet.workletId;
    }

    // phase #2: after the user has preloaded as many judgements as possible,
    // load all the data and return it to the client
    const responsePromise: Promise<PreloadJudgementResponse> = workletPromise.then(
      this.persistenceService.wrapInTransaction(this.requestLogger)(async (transactionalEM) => {
        const countOfFeedbacks = await this.feedbackDAO.count(
          { criteria: { user } },
          transactionalEM,
        );
        const countOfNotPreloadedPairs = await this.judgementPairDAO.countNotPreloaded(
          { criteria: { userId: user.id } },
          transactionalEM,
        );
        const currentOpenJudgements = await this.judgementsDAO.findJudgements(
          { criteria: { user, status: JudgementStatus.TO_JUDGE } },
          transactionalEM,
        );
        const countCurrentFinishedJudgements = await this.judgementsDAO.countJudgements(
          { criteria: { user, status: JudgementStatus.JUDGED } },
          transactionalEM,
        );

        const dbConfig = await this.configDAO.findConfigOrFail({}, transactionalEM);

        const remainingToFinish = dbConfig.annotationTargetPerUser - countCurrentFinishedJudgements;
        const remainingUntilFirstFeedbackRequired =
          dbConfig.annotationTargetToRequireFeedback - countCurrentFinishedJudgements;

        this.requestLogger.log(
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
      }),
    );

    // return workletId and response promise to controller
    // the controller will listen for connection aborts and remove the worklet, if an abort occurs
    return { workletId, responsePromise };
  };

  public removePreloadWorklet = (workletIdToRemove: string): void => {
    this.requestLogger.log(`removing preload worklet, workletId=${workletIdToRemove}`);
    return this.judgementsWorkerService.removePreloadWorklet(workletIdToRemove);
  };

  public saveJudgement = async (
    userId: string,
    judgementId: number,
    judgementData: SaveJudgement,
  ): Promise<void> => {
    const user = await this.userDAO.findUserOrFail({ criteria: { id: userId } });
    const dbJudgement = await this.judgementsDAO.findJudgement({ user, judgementId });

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

      await this.judgementsDAO.saveJudgement({
        data: {
          id: judgementId,
          status: JudgementStatus.JUDGED,
          relevanceLevel: judgementData.relevanceLevel,
          relevancePositions,
          durationUsedToJudgeMs: judgementData.durationUsedToJudgeMs,
          judgedAt: new Date(),
        },
      });
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
    const allJudgements = await this.judgementsDAO.findJudgements({
      criteria: {
        status: JudgementStatus.JUDGED,
      },
    });

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
        relevanceLevel: judgement.relevanceLevel!,
        relevanceCharacterRanges,
        rotate: judgement.rotate,
        mode: judgement.mode,
        durationUsedToJudgeMs: judgement.durationUsedToJudgeMs!,
        judgedAtUnixTS: Math.round(judgement.judgedAt!.getTime() / 1000),
        documentId: judgement.document.document.id,
        queryId: judgement.query.query.id,
        userId: judgement.user.id,
      };
    });
  };

  public getStatistics = async (): Promise<Statistic[]> => {
    this.requestLogger.log('getStatistics');

    const dbConfig = await this.configDAO.findConfigOrFail({});

    // count of all judgements with status JUDGED (i.e., completed judgements)
    const countOfAllCompletedJudgements = await this.judgementsDAO.countJudgements({
      criteria: {
        status: JudgementStatus.JUDGED,
      },
    });

    // count of all judgements with status JUDGED (i.e., completed judgements)
    // in the last 24 hours
    const countOfAllCompletedJudgementsLast24Hours = await this.judgementsDAO.countJudgements({
      criteria: {
        status: JudgementStatus.JUDGED,
        judgedAt: { min: moment().subtract(24, 'hours').toDate() },
      },
    });

    // count of users with at least 5 completed judgements
    const countUsersWithAtLeast5ComplJudgements = await this.judgementsDAO.countJudgementsGroupByUser(
      { status: JudgementStatus.JUDGED, havingCount: { min: 5 } },
    );

    // count of users who reached their annotation targets
    const countUsersTargetReached = await this.judgementsDAO.countJudgementsGroupByUser({
      status: JudgementStatus.JUDGED,
      havingCount: { min: dbConfig.annotationTargetPerUser },
    });

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

function getRotateIndex(countOfAnnotationParts: number) {
  return countOfAnnotationParts / 2;
}
