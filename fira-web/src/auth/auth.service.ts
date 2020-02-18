import { httpClient } from '../http/http.client';
import { store } from '../store/store';
import { createLogger } from '../logger/logger';
import { actions as userActions } from '../store/user/user.slice';

const logger = createLogger('auth.service');

export const authService = {
  login: async (username: string, password: string) => {
    logger.info(`executing login...`, { username });

    const loginResponse = await httpClient.login({ username, password });

    logger.info(`login succeeded! dispatching authenticate...`, { loginResponse });
    store.dispatch(userActions.authenticate(loginResponse));
  },

  refresh: async (refreshToken: string) => {
    logger.info(`executing refresh...`, { refreshToken });

    let refreshResponse;
    try {
      refreshResponse = await httpClient.refresh({ refreshToken });
    } catch (err) {
      logger.error(`refresh failed! dispatching logout...`, err);
      store.dispatch(userActions.logout());
      return;
    }

    logger.info(`refresh succeeded! dispatching authenticate...`, { refreshResponse });
    store.dispatch(userActions.authenticate(refreshResponse));
  },
};
