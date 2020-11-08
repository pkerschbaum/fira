import { PayloadAction } from '@reduxjs/toolkit';

import { createLogger } from '../../commons/logger';

const logger = createLogger('store-logger-middleware');

const loggerMiddleware = (store: any) => (next: any) => (action: PayloadAction) => {
  logger.group(action.type);
  logger.debug(
    'dispatching action...',
    { actionType: action.type },
    { actionPayload: action.payload },
  );
  const result = next(action);
  logger.debug('next state got computed!', undefined, store.getState());
  logger.groupEnd();
  return result;
};

export default loggerMiddleware;
