import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import { setupSubscriptions as setupUserSubscriptions } from './user/user.subscriptions';
import { setupSubscriptions as setupAnnotationSubscriptions } from './annotation/annotation.subscriptions';
import loggerMiddleware from './middleware/logger';

import rootReducer from './reducers';

export const store = configureStore({
  reducer: rootReducer,
  middleware: [loggerMiddleware, ...getDefaultMiddleware()],
});

if (process.env.NODE_ENV !== 'production' && (module as any).hot) {
  (module as any).hot.accept('./reducers', () => store.replaceReducer(rootReducer));
}

const subscriptions = [setupUserSubscriptions, setupAnnotationSubscriptions];
subscriptions.forEach((subscription) => subscription(store));

export type RootState = ReturnType<typeof rootReducer>;
export type RootStore = typeof store;
export type AppDispatch = RootStore['dispatch'];
