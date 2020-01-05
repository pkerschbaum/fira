import { createLogger } from '../logger/logger';

type LocalStorageUser = {
  accessToken: string;
  refreshToken: string;
};

const logger = createLogger('browser-storage');
const USER_KEY = 'user';

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
};
