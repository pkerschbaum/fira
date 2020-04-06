import { createClientId } from './create-client-id';
import { loadStoredData } from './load-stored-data';
import { createLogger } from '../logger/logger';

const bootScripts = [createClientId, loadStoredData];

const logger = createLogger('boot');

export const executeBootScripts = () => {
  logger.info('executing boot scripts...');

  bootScripts.forEach((bootScript) => bootScript());
};
