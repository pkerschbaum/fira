import { createLogger } from '../commons/logger';
import { browserStorage } from '../browser-storage/browser-storage';
import { store } from '../state/store';
import { actions as userActions } from '../state/user/user.slice';

const logger = createLogger('load-stored-data');

export function loadStoredData() {
  logger.info('load user from browser storage');
  const storedUser = browserStorage.getUser();

  if (storedUser) {
    logger.info('stored user found. dispatching authenticate and acknowledge info page...', {
      storedUser,
    });
    store.dispatch(userActions.authenticate(storedUser));
    if (storedUser.acknowledgedInfoPage) {
      store.dispatch(userActions.acknowledgePage({ page: 'INFO' }));
    }
  } else {
    logger.info('no stored user found');
  }
}
