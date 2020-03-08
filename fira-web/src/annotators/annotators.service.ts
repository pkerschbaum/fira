import { createLogger } from '../logger/logger';
import { store } from '../store/store';
import { actions as userActions } from '../store/user/user.slice';

const logger = createLogger('annotators.service');

export const annotatorsService = {
  acknowledgeInfoPage: (redirectOnSuccess: () => void) => {
    logger.info(`executing acknowledgement of info page...`);

    store.dispatch(userActions.acknowledgeInfoPage({ acknowledgedInfoPage: true }));
    redirectOnSuccess();

    logger.info(`acknowledgement of info page succeeded!`);
  },
};
