import { configureStore, combineReducers } from '@reduxjs/toolkit';

import reducer from './user.slice';
import { browserStorage } from '../browser-storage/browser-storage';

const rootReducer = combineReducers({
  user: reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

// listen for changes on user state and synchronize with browser storage
let currentUser = store.getState().user;
store.subscribe(() => {
  if (store.getState().user !== currentUser) {
    // user changed
    currentUser = store.getState().user;
    browserStorage.saveUser(currentUser);
  }
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
