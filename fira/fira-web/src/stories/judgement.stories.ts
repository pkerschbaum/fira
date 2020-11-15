import { createLogger } from '../commons/logger';
import { judgementsClient } from '../http/judgements.client';
import { store } from '../state/store';
import {
  actions as annotationActions,
  JudgementPairStatus,
} from '../state/annotation/annotation.slice';
import { SubmitPayload } from '../ui/annotation-route/elements/AnnotationComponent';

const logger = createLogger('judgements.service');

export const judgementStories = {
  preloadJudgements: async () => {
    logger.info(`executing preload judgements...`);

    const response = await judgementsClient.preloadJudgements();

    logger.info(`preload judgements succeeded! dispatching preload judgements...`, { response });
    store.dispatch(annotationActions.preloadJudgements(response));
  },

  loadJudgementsOfUser: async () => {
    logger.info(`executing load judgements of user...`);

    const response = await judgementsClient.loadJugementsOfUser();

    logger.info(`load judgements of user succeeded!`, { response });
    return response;
  },

  loadJudgementById: async (judgementId: number) => {
    logger.info(`executing load judgement by id...`, { judgementId });

    const response = await judgementsClient.loadJugementById(judgementId);

    logger.info(`load judgement by id succeeded!`, { response });
    return response;
  },

  submitJudgement: async (data: SubmitPayload) => {
    logger.info(`executing submit judgement...`, { data });

    const relevancePositions: number[] = [];
    for (const annotatedRange of data.annotatedRanges) {
      for (let i = annotatedRange.start; i <= annotatedRange.end; i++) {
        relevancePositions.push(i);
      }
    }

    const now = new Date().getTime();
    const durationUsedToJudgeMs = now - data.judgementStartedMs!;

    store.dispatch(
      annotationActions.setJudgementStatus({
        id: data.id,
        status: JudgementPairStatus.SEND_PENDING,
      }),
    );

    try {
      await judgementsClient.submitJudgement(data.id, {
        relevanceLevel: data.relevanceLevel,
        relevancePositions,
        durationUsedToJudgeMs,
      });
    } catch (error) {
      logger.error(`submit judgement failed!`, { id: data.id, error });
      store.dispatch(
        annotationActions.setJudgementStatus({
          id: data.id,
          status: JudgementPairStatus.SEND_FAILED,
        }),
      );
      throw error;
    }

    store.dispatch(
      annotationActions.setJudgementStatus({
        id: data.id,
        status: JudgementPairStatus.SEND_SUCCESS,
      }),
    );

    logger.info(`submit judgement succeeded!`);
  },
};
