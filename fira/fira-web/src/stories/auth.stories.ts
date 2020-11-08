import { createLogger } from '../commons/logger';
import { authClient } from '../http/auth.client';
import { store } from '../state/store';
import { actions as userActions } from '../state/user/user.slice';

const logger = createLogger('auth.stories');

export const authStories = {
  login: async (username: string, password: string) => {
    logger.info(`executing login...`, { username });

    const loginResponse = await authClient.login({ username, password });

    logger.info(`login succeeded! dispatching authenticate...`, { loginResponse });
    store.dispatch(userActions.authenticate(loginResponse));
  },

  refresh: async (refreshToken: string) => {
    logger.info(`executing refresh...`, { refreshToken });

    let refreshResponse;
    try {
      refreshResponse = await authClient.refresh({ refreshToken });
    } catch (err) {
      logger.error(`refresh failed! dispatching logout...`, err);
      store.dispatch(userActions.logout());
      return;
    }

    logger.info(`refresh succeeded! dispatching authenticate...`, { refreshResponse });
    store.dispatch(userActions.authenticate(refreshResponse));
  },
};
