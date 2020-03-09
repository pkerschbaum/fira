import { createLogger } from '../logger/logger';
import { store } from '../store/store';
import { httpClient } from '../http/http.client';
import { actions as userActions } from '../store/user/user.slice';
import { SubmitFeedback } from '../typings/fira-be-typings';

const logger = createLogger('annotators.service');

export const annotatorStories = {
  acknowledgeInfoPage: () => {
    logger.info(`executing acknowledgement of info page...`);

    store.dispatch(userActions.acknowledgeInfoPage({ acknowledgedInfoPage: true }));

    logger.info(`acknowledgement of info page succeeded!`);
  },

  submitFeedback: async (feedbackData: SubmitFeedback) => {
    logger.info(`executing submission of feedback...`);

    await httpClient.submitFeedback(store.getState().user!.accessToken.val, feedbackData);

    logger.info(`submission of feedback succeeded!`);
  },
};
