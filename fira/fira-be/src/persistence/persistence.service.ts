import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';

import { AppLogger } from '../commons/app-logger.service';

const MAX_ATTEMPTS = 5;
const POSTGRES_SERIALIZATION_FAILURE_CODE = '40001';

@Injectable()
export class PersistenceService {
  constructor(private readonly connection: Connection, private readonly appLogger: AppLogger) {
    this.appLogger.setContext('PersistenceService');
  }

  public wrapInTransaction<T, U extends any[]>(cb: (em: EntityManager, ...args: U) => Promise<T>) {
    return async (...args: U) => {
      while (true) {
        let attemptNumber = 1;
        try {
          return await this.connection.transaction('SERIALIZABLE', (transactionalEntityManager) => {
            return cb(transactionalEntityManager, ...args);
          });
        } catch (e) {
          if (e.code !== POSTGRES_SERIALIZATION_FAILURE_CODE || attemptNumber >= MAX_ATTEMPTS) {
            throw e;
          }
          this.appLogger.debug(
            `transaction failed due to serialization failure, retrying...` +
              ` attemptNumber of last attempt was: ${attemptNumber}`,
          );
          attemptNumber++;
        }
      }
    };
  }
}
