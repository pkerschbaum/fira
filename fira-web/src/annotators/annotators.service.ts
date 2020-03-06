import { createLogger } from '../logger/logger';
import { store } from '../store/store';
import { actions as userActions } from '../store/user/user.slice';

const logger = createLogger('annotators.service');

export const annotatorsService = {
  acknowledgeInfoScreen: (redirectOnSuccess: () => void) => {
    logger.info(`executing acknowledgement of info screen...`);

    store.dispatch(userActions.acknowledgeInfoScreen({ acknowledgedInfoScreen: true }));
    redirectOnSuccess();

    logger.info(`acknowledgement of info screen succeeded!`);
  },
};
