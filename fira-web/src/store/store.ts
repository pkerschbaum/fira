import { configureStore, combineReducers } from '@reduxjs/toolkit';
import moment from 'moment';

import reducer from './user.slice';
import { browserStorage } from '../browser-storage/browser-storage';
import { authService } from '../auth/auth.service';

const rootReducer = combineReducers({
  user: reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

// listen for changes on user state and synchronize with browser storage
const REFRESH_OFFSET = moment.duration(1, 'minutes');
let currentUser = store.getState().user;
let scheduleId: NodeJS.Timeout;
store.subscribe(() => {
  if (store.getState().user !== currentUser) {
    // user changed
    currentUser = store.getState().user;

    if (!currentUser) {
      // if no user is present (e.g., logout was executed), clear scheduled refresh and browser storage
      clearTimeout(scheduleId);
      return browserStorage.clearUser();
    }

    // save new user in browser storage
    browserStorage.saveUser({
      accessToken: currentUser.accessToken.val,
      refreshToken: currentUser.refreshToken.val,
    });

    // schedule refresh of token
    const expiry = moment.unix(currentUser.accessToken.expiry);
    const timeStampToRefresh = expiry.subtract(REFRESH_OFFSET);
    const timeUntilRefreshMs = moment.duration(timeStampToRefresh.diff(moment())).asMilliseconds();
    const refreshToken = currentUser.refreshToken.val;
    scheduleId = setTimeout(async () => {
      await authService.refresh(refreshToken);
    }, timeUntilRefreshMs);
  }
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
