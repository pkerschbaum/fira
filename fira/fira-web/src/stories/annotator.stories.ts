import { createLogger } from '../commons/logger';
import { store } from '../state/store';
import { httpClient } from '../http/http.client';
import { actions as userActions } from '../state/user/user.slice';
import { SubmitFeedback } from '../../../fira-commons';

const logger = createLogger('annotators.service');

export const annotatorStories = {
  acknowledgePage: (page: 'INFO' | 'FINISHED') => {
    logger.info(`executing acknowledgement of page...`, { page });

    store.dispatch(userActions.acknowledgePage({ page }));

    logger.info(`acknowledgement of page succeeded!`);
  },

  submitFeedback: async (feedbackData: SubmitFeedback) => {
    logger.info(`executing submission of feedback...`);

    await httpClient.submitFeedback(feedbackData);

    logger.info(`submission of feedback succeeded!`);
  },
};
