import { configureStore, combineReducers, getDefaultMiddleware } from '@reduxjs/toolkit';

import { setupSubscriptions as setupUserSubscriptions } from './user/user.subscriptions';
import { setupSubscriptions as setupAnnotationSubscriptions } from './annotation/annotation.subscriptions';
import loggerMiddleware from './middleware/logger';

import userReducer from './user/user.slice';
import annotationReducer from './annotation/annotation.slice';

const rootReducer = combineReducers({
  user: userReducer,
  annotation: annotationReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: [loggerMiddleware, ...getDefaultMiddleware()],
});

const subscriptions = [setupUserSubscriptions, setupAnnotationSubscriptions];
subscriptions.forEach(subscription => subscription(store));

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type RootStore = typeof store;
