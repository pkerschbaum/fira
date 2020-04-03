import { createLogger } from '../logger/logger';
import { store } from '../store/store';
import { httpClient } from '../http/http.client';
import { actions as userActions } from '../store/user/user.slice';
import { SubmitFeedback } from '../typings/fira-be-typings';

const logger = createLogger('annotators.service');

export const annotatorStories = {
  acknowledgePage: (page: 'INFO' | 'FINISHED') => {
    logger.info(`executing acknowledgement of page...`, { page });

    store.dispatch(userActions.acknowledgePage({ page }));

    logger.info(`acknowledgement of page succeeded!`);
  },

  submitFeedback: async (feedbackData: SubmitFeedback) => {
    logger.info(`executing submission of feedback...`);

    await httpClient.submitFeedback(store.getState().user!.accessToken.val, feedbackData);

    logger.info(`submission of feedback succeeded!`);
  },
};
