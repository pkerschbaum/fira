import moment from 'moment';

import { httpClient } from '../http/http.client';
import { store } from '../store/store';
import { createLogger } from '../logger/logger';
import { actions as userActions } from '../store/user/user.slice';

const logger = createLogger('auth.service');

export const authService = {
  login: async (username: string, password: string) => {
    logger.info(`executing login...`, { username });

    const loginResponse = await httpClient.login({ username, password });

    logger.info(`login succeeded!`, { loginResponse });
    store.dispatch(userActions.authenticate(loginResponse));
  },

  refresh: async (refreshToken: string) => {
    logger.info(`executing refresh...`, { refreshToken });

    let refreshResponse;
    try {
      refreshResponse = await httpClient.refresh({ refreshToken });
    } catch (err) {
      logger.error(`refresh failed!`, err);
      store.dispatch(userActions.logout());
      return;
    }

    logger.info(`refresh succeeded!`, { refreshResponse });
    store.dispatch(userActions.authenticate(refreshResponse));
  },

  accessTokenExpired: (): boolean => {
    const user = store.getState().user;

    if (!user) {
      return true;
    }
    const accessTokenExpiry = moment.unix(user.accessToken.expiry);

    return accessTokenExpiry.isBefore(moment.now());
  },
};
