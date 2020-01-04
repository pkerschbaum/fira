import { loadStoredUser } from './load-stored-user';
import { createLogger } from '../logger/logger';

const bootScripts = [loadStoredUser];

const logger = createLogger('boot');

export const executeBootScripts = () => {
  logger.info('executing boot scripts...');

  bootScripts.forEach(bootScript => bootScript());
};
