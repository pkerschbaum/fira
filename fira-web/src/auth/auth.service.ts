import moment from 'moment';

import { httpClient } from '../http/http.client';
import { store } from '../store/store';
import { actions as userActions } from '../store/user.slice';

export const authService = {
  login: async (username: string, password: string) => {
    const loginResponse = await httpClient.login({ username, password });
    store.dispatch(userActions.authenticate(loginResponse));
  },

  refresh: async (refreshToken: string) => {
    let refreshResponse;
    try {
      refreshResponse = await httpClient.refresh({ refreshToken });
    } catch {
      // refresh failed --> logout
      store.dispatch(userActions.logout());
      return;
    }
    store.dispatch(userActions.authenticate(refreshResponse));
  },

  getRole: (): 'anonym' | 'annotator' | 'admin' => {
    const user = store.getState().user;
    if (!user) {
      return 'anonym';
    }

    return user.role;
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
