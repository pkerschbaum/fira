import { createLogger } from '../logger/logger';
import { browserStorage } from '../browser-storage/browser-storage';
import { nanoid } from 'nanoid';

const ID_SIZE = 10;

const logger = createLogger('create-client-id');

export function createClientId() {
  const storedClientId = browserStorage.getClientId();

  if (storedClientId) {
    logger.info('stored clientId found, skipping creation of clientId');
  } else {
    logger.info('no stored clientId found. creating and saving clientId...');
    const newClientId = nanoid(ID_SIZE);
    browserStorage.saveClientId(newClientId);
  }
}
