import { createLogger } from '../commons/logger';
import { createClientId } from './create-client-id';
import { loadStoredData } from './load-stored-data';
import { logUserAgentInfo } from './log-user-agent-info';

const bootScripts: Array<(() => void | Promise<void>)[]> = [
  [createClientId],
  [logUserAgentInfo, loadStoredData],
];

const logger = createLogger('boot');

export const executeBootScripts = async () => {
  logger.info('executing boot scripts...');

  for (const concurrentScripts of bootScripts) {
    await Promise.all(concurrentScripts.map((script) => script()));
  }
};
