import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';

import { RequestLogger } from '../commons/request-logger.service';

const SERVICE_NAME = 'PersistenceService';
const MAX_ATTEMPTS = 5;
const POSTGRES_SERIALIZATION_FAILURE_CODE = '40001';

@Injectable()
export class PersistenceService {
  constructor(
    private readonly connection: Connection,
    private readonly requestLogger: RequestLogger,
  ) {
    this.requestLogger.setContext(SERVICE_NAME);
  }

  public wrapInTransaction<T, U extends any[]>(cb: (em: EntityManager, ...args: U) => Promise<T>) {
    return async (...args: U) => {
      let attemptNumber = 1;
      while (true) {
        try {
          return await this.connection.transaction('SERIALIZABLE', (transactionalEntityManager) => {
            return cb(transactionalEntityManager, ...args);
          });
        } catch (e) {
          if (e.code !== POSTGRES_SERIALIZATION_FAILURE_CODE || attemptNumber >= MAX_ATTEMPTS) {
            throw e;
          }
          this.requestLogger.debug(
            `transaction failed due to serialization failure, retrying...` +
              ` attemptNumber of last attempt was: ${attemptNumber}`,
          );
          attemptNumber++;
        }
      }
    };
  }
}
