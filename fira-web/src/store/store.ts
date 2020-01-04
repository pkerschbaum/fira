import { configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';

import { setupSubscriptions } from './store-subscriptions';
import loggerMiddleware from './middleware/logger';

import reducer from './user.slice';

const rootReducer = combineReducers({
  user: reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: [loggerMiddleware, ...getDefaultMiddleware()],
});

setupSubscriptions(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type RootStore = typeof store;
