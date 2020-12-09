import { Injectable, NotFoundException, BadRequestException, Scope, Inject } from '@nestjs/common';
import * as Knex from 'knex';
import moment = require('moment');
import d3 = require('d3');

import * as config from '../config';
import { RequestLogger } from '../commons/logger/request-logger';
import { KnexClient, KNEX_CLIENT } from '../persistence/persistence.constants';
import { PersistenceService } from '../persistence/persistence.service';
import { JudgementsDAO } from '../persistence/daos/judgements.dao';
import { JudgementPairsDAO, PairQueryResult } from '../persistence/daos/judgement-pairs.dao';
import { DocumentVersionsDAO } from '../persistence/daos/document-versions.dao';
import { QueryVersionsDAO } from '../persistence/daos/query-versions.dao';
import { FeedbacksDAO } from '../persistence/daos/feedbacks.dao';
import { ConfigsDAO } from '../persistence/daos/configs.dao';
import { UsersDAO } from '../persistence/daos/users.dao';
import { JudgementStatus } from '../typings/enums';
import { httpUtils } from '../utils/http.utils';
import { adminSchema, judgementsSchema } from '@fira-commons';
import { judgementGetPayload } from '@fira-commons/database/prisma';

const EXPORT_PAGE_SIZE = 200;

@Injectable({ scope: Scope.REQUEST })
export class JudgementsService {
  constructor(
    private readonly requestLogger: RequestLogger,
    @Inject(KNEX_CLIENT) private readonly knexClient: KnexClient,
    private readonly persistenceService: PersistenceService,
    private readonly judgementsDAO: JudgementsDAO,
    private readonly judgementPairsDAO: JudgementPairsDAO,
    private readonly documentVersionsDAO: DocumentVersionsDAO,
    private readonly queryVersionsDAO: QueryVersionsDAO,
    private readonly feedbacksDAO: FeedbacksDAO,
    private readonly configsDAO: ConfigsDAO,
    private readonly userDAO: UsersDAO,
  ) {
    this.requestLogger.setComponent(this.constructor.name);
  }

  public preload = async (userId: string): Promise<judgementsSchema.PreloadJudgementResponse> => {
    const user = await this.userDAO.findOneOrFail({ where: { id: userId } });

    // determine how many judgements should, and can, be preloaded for the user.
    const countOfOpenJudgements = await this.judgementsDAO.count({
      where: { status: JudgementStatus.TO_JUDGE, user_id: userId },
    });
    const countJudgementsToPreload =
      config.application.judgementsPreloadSize - countOfOpenJudgements;

    // if at least one judgement must get preloaded, do that (inside a transaction)
    if (countJudgementsToPreload < 1) {
      this.requestLogger.log(
        `no judgements should get preloaded for this user, userId=${user.id}, countJudgementsToPreload=${countJudgementsToPreload}`,
      );
    } else {
      const countOfNotPreloadedPairs = await this.judgementPairsDAO.countNotPreloaded(
        { where: { user_id: userId } },
        this.knexClient,
      );
      if (countOfNotPreloadedPairs === 0) {
        this.requestLogger.log(`user has annotated every possible judgement pair --> no preload`);
      } else {
        await this.preloadJudgements({ userId });
      }
    }

    // after the user has preloaded as many judgements as possible,
    // load all the data and return it to the client
    const countOfFeedbacks = await this.feedbacksDAO.count({ where: { user_id: userId } });

    const countOfNotPreloadedPairs = await this.judgementPairsDAO.countNotPreloaded(
      { where: { user_id: userId } },
      this.knexClient,
    );

    const currentOpenJudgements = await this.judgementsDAO.findMany({
      where: { user_id: userId, status: JudgementStatus.TO_JUDGE },
      include: {
        document_version_document_versionTojudgement: true,
        query_version_judgementToquery_version: true,
      },
    });
    const countCurrentFinishedJudgements = await this.judgementsDAO.count({
      where: { user_id: userId, status: JudgementStatus.JUDGED },
    });

    const dbConfig = httpUtils.throwIfNullish(await this.configsDAO.findFirst());

    const remainingToFinish = dbConfig.annotation_target_per_user - countCurrentFinishedJudgements;
    const remainingUntilFirstFeedbackRequired =
      dbConfig.annotation_target_to_require_feedback - countCurrentFinishedJudgements;

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
  };

  private preloadJudgements = this.persistenceService.wrapInTransaction(this.requestLogger)(
    async (trx, { userId }: { userId: string }): Promise<void> => {
      const dbConfig = httpUtils.throwIfNullish(await trx(`config`).first());

      const countOfOpenJudgements = await this.judgementPairsDAO.countTrx(
        {
          where: {
            user_id: userId,
            status: JudgementStatus.TO_JUDGE,
          },
        },
        trx,
      );
      let countJudgementsToPreload =
        config.application.judgementsPreloadSize - countOfOpenJudgements;

      if (countJudgementsToPreload < 1) {
        this.requestLogger.log(
          `no judgements should get preloaded for this user, countJudgementsToPreload=${countJudgementsToPreload}`,
        );
        return;
      }

      // there is at least one judgement pair left for this user to annotate
      // --> apply preload logic and store preloaded judgements
      this.requestLogger.log(
        `preloading judgements for this user... countJudgementsToPreload=${countJudgementsToPreload}`,
      );

      // get available priorities
      const { countOfPairsWithPrioAll } = await this.judgementPairsDAO.getAvailablePriorities(
        {},
        trx,
      );

      // if at least one pair with prio "all" exists, check if the user should get some of this
      // pairs as his next pairs preloaded
      if (countOfPairsWithPrioAll > 0) {
        const stepSizeToPreloadPrioAllPair = Math.floor(
          dbConfig.annotation_target_per_user / countOfPairsWithPrioAll,
        );
        const countOfAllJudgements = await this.judgementPairsDAO.countTrx(
          {
            where: { user_id: userId },
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
                user_id: userId,
                priority: 'all',
              },
            },
            trx,
          );

          let countPrioAllPairsMissing =
            countPrioAllPairsUserShouldHave - countPrioAllPairsUserActuallyHas;

          while (countPrioAllPairsMissing > 0 && countJudgementsToPreload > 0) {
            const pairCandidates: PairQueryResult[] = await this.judgementPairsDAO.findNotPreloaded(
              { where: { user_id: userId, priority: 'all' }, limit: 1 },
              trx,
            );

            if (pairCandidates.length < 1) {
              this.requestLogger.warn(
                `although the user should have got at least one judgement pair with priority=all preloaded, ` +
                  `no such judgement pair which the user has not judged yet could be found. ` +
                  `countPrioAllPairsUserShouldHave=${countPrioAllPairsUserShouldHave}, countPrioAllPairsUserActuallyHas=${countPrioAllPairsUserActuallyHas}`,
              );
              break;
            }

            const pairsToPersist = pairCandidates[0];

            await this.persistPairs(
              trx,
              [pairsToPersist],
              userId,
              dbConfig.judgement_mode as judgementsSchema.JudgementMode,
              dbConfig.rotate_document_text,
            );

            this.requestLogger.log(`a pair with priority "all" got preloaded`);

            countJudgementsToPreload--;
            countPrioAllPairsMissing--;
          }
        }
      }

      if (countJudgementsToPreload < 1) {
        return;
      }

      // get next judgement pairs which should get judged, and have not been judged by this user
      const pairCandidates = await this.judgementPairsDAO.getCandidatesByPriority(
        {
          where: { user_id: userId },
          limit: countJudgementsToPreload,
          dbConfig,
        },
        trx,
      );

      await this.persistPairs(
        trx,
        pairCandidates,
        userId,
        dbConfig.judgement_mode as judgementsSchema.JudgementMode,
        dbConfig.rotate_document_text,
      );
    },
  );

  private persistPairs = async (
    trx: Knex.Transaction,
    pairs: PairQueryResult[],
    userId: string,
    judgementMode: judgementsSchema.JudgementMode,
    rotateDocumentTextRequested: boolean,
  ): Promise<void> => {
    let rotateFlagForUnevenPair: boolean;
    if (rotateDocumentTextRequested) {
      /*
       * determine how often each variant - rotation or no-rotation - was used,
       * and set the variant which was used less often.
       *
       * rotateFlagForUnevenPair will be set for the 1st, 3rd, 5th (and so on) pair. The inverse will
       * be set for the 2nd, 4th, 6th (and so on) pair.
       */
      const rotateStats = await this.judgementsDAO.countJudgementsGroupByRotate({}, trx);
      const countRotate = rotateStats.find((elem) => elem.rotate)?.count ?? 0;
      const countNoRotate = rotateStats.find((elem) => !elem.rotate)?.count ?? 0;
      rotateFlagForUnevenPair = countRotate < countNoRotate;
    }

    await Promise.all(
      pairs.map(async (pair, idx) => {
        // determine whether to set 'rotate text'-flag or not for this pair
        let rotate: boolean;
        if (!rotateDocumentTextRequested) {
          // according to the server config, no rotation should be done
          rotate = false;
        } else {
          rotate = idx % 2 === 0 ? rotateFlagForUnevenPair : !rotateFlagForUnevenPair;
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

        this.requestLogger.log(
          `persisting judgement, documentId=${pair.document_id}, queryId=${pair.query_id}, rotate=${rotate}, mode=${judgementMode}, userId=${userId}`,
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
              user_id: userId,

              relevance_level: null,
              relevance_positions: [],
              duration_used_to_judge_ms: null,
              judged_at: null,
            },
          },
          trx,
        );
      }),
    );
  };

  public loadJudgementsOfUser = async (
    userId: string,
  ): Promise<judgementsSchema.LoadJugementsOfUserResponse> => {
    const judgementsOfUser = await this.judgementsDAO.findMany({
      where: { user_id: userId, status: JudgementStatus.JUDGED },
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    return {
      judgements: judgementsOfUser.map((dbJudgement, idx) => ({
        id: dbJudgement.id,
        nr: idx + 1,
      })),
    };
  };

  public loadJudgement = async (
    userId: string,
    judgementId: number,
  ): Promise<judgementsSchema.LoadJudgementResponse> => {
    const dbJudgement = httpUtils.throw404IfNullish(
      await this.judgementsDAO.findOne({
        where: { id: judgementId },
        include: {
          query_version_judgementToquery_version: true,
          document_version_document_versionTojudgement: true,
        },
      }),
    );

    if (dbJudgement.user_id !== userId) {
      throw new NotFoundException(
        `the judgement does not belong to the given user id! judgemendId=${judgementId}, userId=${userId}`,
      );
    }
    if (dbJudgement.status !== JudgementStatus.JUDGED) {
      throw new BadRequestException(
        `only judged judgements are allowed to get loaded! judgemendId=${judgementId}, userId=${userId}`,
      );
    }

    const mappedJudgement = mapJudgementsToResponse([dbJudgement])[0];

    // if relevance positions are stored rotated in the db, revert the rotation
    let relevancePositions = dbJudgement.relevance_positions;
    if (dbJudgement.rotate) {
      const annotateParts = dbJudgement.document_version_document_versionTojudgement.annotate_parts;
      const rotateIndex = Math.ceil(getRotateIndex(annotateParts.length));
      const rotateIndex2 = Math.floor(getRotateIndex(annotateParts.length));
      relevancePositions = relevancePositions.map((relevancePosition) =>
        relevancePosition >= rotateIndex
          ? relevancePosition - rotateIndex
          : relevancePosition + rotateIndex2,
      );
    }

    return {
      ...mappedJudgement,
      documentText: dbJudgement.document_version_document_versionTojudgement.text,
      relevanceLevel: dbJudgement.relevance_level as judgementsSchema.RelevanceLevel,
      relevancePositions,
    };
  };

  public submitJudgement = async (
    userId: string,
    judgementId: number,
    judgementData: judgementsSchema.SaveJudgement,
  ): Promise<void> => {
    const dbJudgement = httpUtils.throw404IfNullish(
      await this.judgementsDAO.findOne({
        where: { id: judgementId },
        include: { document_version_document_versionTojudgement: true },
      }),
    );

    if (dbJudgement.user_id !== userId) {
      throw new NotFoundException(
        `the judgement does not belong to the given user id! judgemendId=${judgementId}, userId=${userId}`,
      );
    }

    const annotateParts = dbJudgement.document_version_document_versionTojudgement.annotate_parts;

    // if relevance positions got rotated when sent to the client, then the server has to
    // revert the rotation
    let relevancePositions = judgementData.relevancePositions;
    if (dbJudgement.rotate) {
      const rotateIndex = Math.ceil(getRotateIndex(annotateParts.length));
      const rotateIndex2 = Math.floor(getRotateIndex(annotateParts.length));
      relevancePositions = relevancePositions.map((relevancePosition) =>
        relevancePosition >= rotateIndex
          ? relevancePosition - rotateIndex
          : relevancePosition + rotateIndex2,
      );
    }

    if (
      relevancePositions.length > annotateParts.length ||
      relevancePositions.some((position) => position >= annotateParts.length || position < 0)
    ) {
      this.requestLogger.error(
        `at least one submitted relevance position is out of bound, regarding the size of the document. ` +
          `judgementId=${dbJudgement.id}, documentId=${dbJudgement.document_document}, queryId=${dbJudgement.query_query}, rotate=${dbJudgement.rotate}, ` +
          `relevancePositions=${JSON.stringify(relevancePositions)}, ` +
          `dbJudgement.document.annotateParts=${JSON.stringify(annotateParts)}`,
      );
      throw new BadRequestException(
        `at least one submitted relevance position is out of bound, regarding the size of the document`,
      );
    }

    this.requestLogger.log(
      `open judgement got judged, id=${judgementId}, data=${JSON.stringify(judgementData)}`,
    );

    await this.judgementsDAO.update({
      where: { id: judgementId },
      data: {
        status: JudgementStatus.JUDGED,
        relevance_level: judgementData.relevanceLevel,
        relevance_positions: relevancePositions,
        duration_used_to_judge_ms: judgementData.durationUsedToJudgeMs,
        judged_at: new Date(),
      },
    });
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

  private exportJudgements = async (): Promise<judgementsSchema.ExportJudgement[]> => {
    const allJudgements = [];

    let skip = 0;
    while (true) {
      const judgementsPage = await this.judgementsDAO.findMany({
        where: { status: JudgementStatus.JUDGED },
        include: { document_version_document_versionTojudgement: true },
        orderBy: { id: 'asc' },
        skip,
        take: EXPORT_PAGE_SIZE,
      });
      allJudgements.push(...judgementsPage);

      if (judgementsPage.length === EXPORT_PAGE_SIZE) {
        // there could be more entries in the table --> fetch next page
        skip += EXPORT_PAGE_SIZE;
      } else {
        // fetched the last page --> stop
        break;
      }
    }

    this.requestLogger.debug(`got db data, now mapping...`);

    return allJudgements.map((judgement) => {
      const partsAvailable = judgement.document_version_document_versionTojudgement.annotate_parts;
      const partsAnnotated = judgement.relevance_positions;

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
        relevanceLevel: judgement.relevance_level! as judgementsSchema.RelevanceLevel,
        relevanceCharacterRanges,
        rotate: judgement.rotate,
        mode: judgement.mode as judgementsSchema.JudgementMode,
        durationUsedToJudgeMs: judgement.duration_used_to_judge_ms!,
        judgedAtUnixTS: Math.round(judgement.judged_at!.getTime() / 1000),
        documentId: judgement.document_document,
        queryId: judgement.query_query,
        userId: judgement.user_id,
      };
    });
  };

  public getStatistics = async (): Promise<adminSchema.Statistic[]> => {
    this.requestLogger.log('getStatistics');

    const dbConfig = await this.configsDAO.findFirstOrFail();

    // count of all judgements with status JUDGED (i.e., completed judgements)
    const countOfAllCompletedJudgements = await this.judgementsDAO.count({
      where: { status: JudgementStatus.JUDGED },
    });

    // count of all judgements with status JUDGED (i.e., completed judgements)
    // in the last 24 hours
    const countOfAllCompletedJudgementsLast24Hours = await this.judgementsDAO.count({
      where: {
        status: JudgementStatus.JUDGED,
        judged_at: { gte: moment().subtract(24, 'hours').toDate() },
      },
    });

    // count of users with at least 5 completed judgements
    const countUsersWithAtLeast5ComplJudgements = await this.judgementsDAO.countByUser({
      where: { status: JudgementStatus.JUDGED },
      havingCount: { min: 5 },
    });

    // count of users who reached their annotation targets
    const countUsersTargetReached = await this.judgementsDAO.countByUser({
      where: { status: JudgementStatus.JUDGED },
      havingCount: { min: dbConfig.annotation_target_per_user },
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

function mapJudgementsToResponse(
  openJudgements: Array<
    judgementGetPayload<{
      include: {
        document_version_document_versionTojudgement: true;
        query_version_judgementToquery_version: true;
      };
    }>
  >,
): judgementsSchema.PreloadJudgement[] {
  return openJudgements
    .map((openJudgement) => {
      // rotate text (annotation parts), if requested to do so
      let annotationParts =
        openJudgement.document_version_document_versionTojudgement.annotate_parts;
      if (openJudgement.rotate) {
        const rotateIndex = Math.floor(getRotateIndex(annotationParts.length));
        annotationParts = annotationParts
          .slice(rotateIndex, annotationParts.length)
          .concat(annotationParts.slice(0, rotateIndex));
      }

      return {
        id: openJudgement.id,
        queryText: openJudgement.query_version_judgementToquery_version.text,
        docAnnotationParts: annotationParts,
        mode: openJudgement.mode as judgementsSchema.JudgementMode,
      };
    })
    .sort((judg1, judg2) => judg1.id - judg2.id);
}

function getRotateIndex(countOfAnnotationParts: number) {
  return countOfAnnotationParts / 2;
}
