import { browserStorage } from '../browser-storage/browser-storage';
import { store } from '../store/store';
import { actions as userActions } from '../store/user.slice';

export function loadStoredUser() {
  const storedUser = browserStorage.getUser();
  if (storedUser) {
    store.dispatch(userActions.authenticate(storedUser));
  }
}
