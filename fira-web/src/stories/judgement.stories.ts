import { httpClient } from '../http/http.client';
import { createLogger } from '../logger/logger';
import { store } from '../store/store';
import {
  actions as annotationActions,
  JudgementPairStatus,
} from '../store/annotation/annotation.slice';
import { RelevanceLevel, RateLevels } from '../typings/enums';

const logger = createLogger('judgements.service');

export const judgementStories = {
  preloadJudgements: async () => {
    logger.info(`executing preload judgements...`);

    const response = await httpClient.preloadJudgements(store.getState().user!.accessToken.val);

    logger.info(`preload judgements succeeded! dispatching preload judgements...`, { response });
    store.dispatch(annotationActions.preloadJudgements(response));
  },

  rateJudgementPair: async (relevanceLevel: RelevanceLevel) => {
    logger.info(`executing rate judgement pair...`);

    store.dispatch(annotationActions.rateJudgementPair({ relevanceLevel }));

    const annotationState = store.getState().annotation;
    const currentJudgementPair = annotationState.judgementPairs.find(
      pair => pair.id === annotationState.currentJudgementPairId,
    )!;
    const currentRateLevel = RateLevels.find(
      rateLevel => rateLevel.relevanceLevel === currentJudgementPair.relevanceLevel,
    );

    if (!currentRateLevel!.annotationRequired || currentJudgementPair!.annotatedRanges.length > 0) {
      // if the chosen rate level does not require annotation, or it does and regions are
      // annotated already,
      // immediately submit current judgement and proceed
      await judgementStories.submitCurrentJudgement();
    }

    logger.info(`rate judgement pair succeeded!`);
  },

  submitCurrentJudgement: async () => {
    logger.info(`executing submit current judgement...`);

    const annotationState = store.getState().annotation;
    const currentJudgementPair = annotationState.judgementPairs.find(
      pair => pair.id === annotationState.currentJudgementPairId,
    )!;
    const relevancePositions: number[] = [];
    for (const annotatedRange of currentJudgementPair.annotatedRanges) {
      for (let i = annotatedRange.start; i <= annotatedRange.end; i++) {
        relevancePositions.push(i);
      }
    }

    const now = new Date().getTime();
    const durationUsedToJudgeMs = now - annotationState.currentJudgementPairSelectedOnMs!;

    store.dispatch(
      annotationActions.setJudgementStatus({
        id: currentJudgementPair.id,
        status: JudgementPairStatus.SEND_PENDING,
      }),
    );

    try {
      await httpClient.submitJudgement(
        store.getState().user!.accessToken.val,
        currentJudgementPair.id,
        {
          relevanceLevel: currentJudgementPair.relevanceLevel!,
          relevancePositions,
          durationUsedToJudgeMs,
        },
      );
    } catch (error) {
      logger.error(`submit current judgement failed!`, { id: currentJudgementPair.id, error });
      store.dispatch(
        annotationActions.setJudgementStatus({
          id: currentJudgementPair.id,
          status: JudgementPairStatus.SEND_FAILED,
        }),
      );
      throw error;
    }

    store.dispatch(
      annotationActions.setJudgementStatus({
        id: currentJudgementPair.id,
        status: JudgementPairStatus.SEND_SUCCESS,
      }),
    );

    logger.info(`submit current judgement succeeded!`);
  },
};
