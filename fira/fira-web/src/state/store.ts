import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { useSelector as useReduxSelector, TypedUseSelectorHook } from 'react-redux';

import { setupSubscriptions as setupUserSubscriptions } from './user/user.subscriptions';
import { setupSubscriptions as setupAnnotationSubscriptions } from './annotation/annotation.subscriptions';

import loggerMiddleware from './middleware/logger.middleware';
import rootReducer from './reducers';

export const store = configureStore({
  reducer: rootReducer,
  middleware: [loggerMiddleware, ...getDefaultMiddleware()],
});

const subscriptions = [setupUserSubscriptions, setupAnnotationSubscriptions];
subscriptions.forEach((subscription) => subscription(store));

export type RootState = ReturnType<typeof rootReducer>;
export type RootStore = typeof store;
export type AppDispatch = RootStore['dispatch'];

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
