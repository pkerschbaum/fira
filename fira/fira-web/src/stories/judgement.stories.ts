import { useMutation, useQuery, useQueryCache } from 'react-query';

import { createLogger } from '../commons/logger';
import { judgementsClient } from '../http/judgements.client';
import { store } from '../state/store';
import {
  actions as annotationActions,
  JudgementPairStatus,
} from '../state/annotation/annotation.slice';
import { judgementsSchema } from '../../../fira-commons';

type SubmitPayload = {
  id: number;
  relevanceLevel: judgementsSchema.RelevanceLevel;
  annotatedRanges: Array<{ start: number; end: number }>;
  judgementStartedMs: number;
};

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

export const useQueryJudgements = () => {
  return useQuery(
    'judgements-of-user',
    async () => {
      const response = await judgementStories.loadJudgementsOfUser();
      response.judgements.sort((a, b) => b.nr - a.nr); // descending by number
      return response;
    },
    {
      retry: false,
      refetchInterval: false,
    },
  );
};

export const useQueryJudgement = (judgementId: number, queryOptions?: { cacheTime: number }) => {
  return useQuery(
    ['judgement', judgementId],
    () => judgementStories.loadJudgementById(judgementId),
    { retry: false, refetchInterval: false, ...queryOptions },
  );
};

export const useMutateJudgement = () => {
  const queryCache = useQueryCache();
  const [mutate] = useMutation(judgementStories.submitJudgement);
  return function mutateJudgement(...args: Parameters<typeof judgementStories.submitJudgement>) {
    return mutate(...args, {
      onSuccess: () => {
        queryCache.removeQueries(['judgement', args[0].id]);
      },
    });
  };
};
