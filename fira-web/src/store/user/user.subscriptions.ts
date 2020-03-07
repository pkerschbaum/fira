import moment from 'moment';

import { browserStorage } from '../../browser-storage/browser-storage';
import { authService } from '../../auth/auth.service';
import { createLogger } from '../../logger/logger';
import { RootStore } from '../store';

const logger = createLogger('user.subscriptions');

export const setupSubscriptions = (store: RootStore) => {
  // listen for changes on user state and synchronize with browser storage
  const REFRESH_OFFSET = moment.duration(1, 'minutes');
  let currentUser = store.getState().user;
  let scheduleId: NodeJS.Timeout | undefined;

  store.subscribe(() => {
    const userOfStore = store.getState().user;
    if (userOfStore !== currentUser) {
      logger.info('user changed', { previousUser: currentUser, userOfStore });

      currentUser = userOfStore;

      // clear old schedule of refresh of token, if present
      if (scheduleId) {
        clearTimeout(scheduleId);
      }

      if (!currentUser) {
        // if no user is present (e.g., logout was executed), clear scheduled refresh and browser storage
        logger.info('no user present, clear scheduled refresh and browser storage');
        return browserStorage.clearUser();
      }

      // save new user in browser storage
      browserStorage.saveUser({
        accessToken: currentUser.accessToken.val,
        refreshToken: currentUser.refreshToken.val,
        acknowledgedInfoScreen: currentUser.acknowledgedInfoScreen,
      });
      logger.info('user saved to browser storage');

      // schedule refresh of token
      const expiry = moment.unix(currentUser.accessToken.expiry);
      const timeStampToRefresh = expiry.subtract(REFRESH_OFFSET);
      const timeUntilRefreshMs = moment
        .duration(timeStampToRefresh.diff(moment()))
        .asMilliseconds();
      const refreshToken = currentUser.refreshToken.val;

      scheduleId = setTimeout(async () => {
        await authService.refresh(refreshToken);
      }, timeUntilRefreshMs);

      logger.info(`refresh got scheduled, scheduled at: ${timeStampToRefresh.toString()}`);
    }
  });
};
