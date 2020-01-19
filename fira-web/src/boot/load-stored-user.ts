import { browserStorage } from '../browser-storage/browser-storage';
import { store } from '../store/store';
import { actions as userActions } from '../store/user/user.slice';
import { createLogger } from '../logger/logger';

const logger = createLogger('load-stored-user');

export function loadStoredUser() {
  logger.info('load user from browser storage');
  const storedUser = browserStorage.getUser();

  if (storedUser) {
    logger.info('stored user found. dispatching authenticate...', { storedUser });
    store.dispatch(userActions.authenticate(storedUser));
  } else {
    logger.info('no stored user found');
  }
}
