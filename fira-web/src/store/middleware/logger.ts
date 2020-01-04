import { createLogger } from '../../logger/logger';

const logger = createLogger('store-logger-middleware');

const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
  logger.group(action.type);
  logger.info('dispatching', action);
  const result = next(action);
  logger.info('next state', store.getState());
  logger.groupEnd();
  return result;
};

export default loggerMiddleware;
