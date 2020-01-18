import { httpClient } from '../http/http.client';
import { createLogger } from '../logger/logger';
import { store } from '../store/store';
import { actions as annotationActions } from '../store/annotation.slice';

const logger = createLogger('judgements.service');

export const judgementsService = {
  preloadJudgements: async () => {
    logger.info(`executing preload judgements...`);

    const response = await httpClient.preloadJudgements(store.getState().user!.accessToken.val);
    store.dispatch(annotationActions.preloadJudgements(response));

    logger.info(`preload judgements succeeded!`, { response });
    return response;
  },
};
