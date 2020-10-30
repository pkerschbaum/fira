import { createLogger } from '../commons/logger';
import { browserStorage } from '../commons/browser-storage';
import { uniqueIdGenerator, strings } from '../../../fira-commons';

const logger = createLogger('create-client-id');

export function createClientId() {
  const storedClientId = browserStorage.getClientId();

  if (!strings.isNullishOrEmpty(storedClientId)) {
    logger.debug('stored clientId found, skipping creation of clientId');
  } else {
    logger.debug('no stored clientId found. creating and saving clientId...');
    const newClientId = uniqueIdGenerator.generate();
    browserStorage.saveClientId(newClientId);
  }
}
