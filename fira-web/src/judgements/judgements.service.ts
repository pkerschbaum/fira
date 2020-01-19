import { httpClient } from '../http/http.client';
import { createLogger } from '../logger/logger';
import { store } from '../store/store';
import { actions as annotationActions } from '../store/annotation/annotation.slice';

const logger = createLogger('judgements.service');

export const judgementsService = {
  preloadJudgements: async () => {
    logger.info(`executing preload judgements...`);

    const response = await httpClient.preloadJudgements(store.getState().user!.accessToken.val);
    store.dispatch(annotationActions.preloadJudgements(response));

    logger.info(`preload judgements succeeded!`, { response });
    return response;
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

    const durationUsedToJudgeMs = 0; // TODO implement

    await httpClient.submitJudgement(
      store.getState().user!.accessToken.val,
      currentJudgementPair.id,
      {
        relevanceLevel: currentJudgementPair.relevanceLevel!,
        relevancePositions,
        durationUsedToJudgeMs,
      },
    );
    // TODO dispatch success

    logger.info(`submit current judgement succeeded!`);
  },
};
