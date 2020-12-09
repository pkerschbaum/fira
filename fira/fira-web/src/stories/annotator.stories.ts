import { createLogger } from '../commons/logger';
import { feedbackClient } from '../http/feedback.client';
import { store } from '../state/store';
import { actions as userActions } from '../state/user/user.slice';
import { feedbackSchema } from '@fira-commons';

const logger = createLogger('annotators.service');

export const annotatorStories = {
  acknowledgePage: (page: 'INFO' | 'FINISHED') => {
    logger.info(`executing acknowledgement of page...`, { page });

    store.dispatch(userActions.acknowledgePage({ page }));

    logger.info(`acknowledgement of page succeeded!`);
  },

  submitFeedback: async (feedbackData: feedbackSchema.SubmitFeedback) => {
    logger.info(`executing submission of feedback...`);

    await feedbackClient.submitFeedback(feedbackData);

    logger.info(`submission of feedback succeeded!`);
  },
};
