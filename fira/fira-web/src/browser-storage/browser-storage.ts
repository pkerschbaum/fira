import { createLogger } from '../logger/logger';

type LocalStorageUser = {
  accessToken: string;
  refreshToken: string;
  acknowledgedInfoPage: boolean;
};

const USER_KEY = 'user';
const CLIENT_ID_KEY = 'client-id';

const logger = createLogger('browser-storage');

export const browserStorage = {
  saveUser: (user: LocalStorageUser) => {
    logger.info('saveUser called', { user });

    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser: () => {
    logger.info('clearUser called');

    localStorage.removeItem(USER_KEY);
  },

  getUser: (): LocalStorageUser | null => {
    logger.info('getUser called');

    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedUser) {
      logger.info('no user found');
      return null;
    }
    logger.info('user found', { currentlyStoredUser: storedUser });
    return JSON.parse(storedUser) as LocalStorageUser;
  },

  saveClientId: (clientId: string) => {
    logger.info('saveClientId called', { clientId });

    localStorage.setItem(CLIENT_ID_KEY, clientId);
  },

  getClientId: (): string | null => {
    logger.info('getClientId called');

    return localStorage.getItem(CLIENT_ID_KEY);
  },
};
