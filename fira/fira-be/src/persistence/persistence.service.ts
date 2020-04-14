import { Injectable, LoggerService } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';

const SERVICE_NAME = 'PersistenceService';
const MAX_ATTEMPTS = 5;
const POSTGRES_SERIALIZATION_FAILURE_CODE = '40001';

@Injectable()
export class PersistenceService {
  constructor(private readonly connection: Connection) {}

  public wrapInTransaction = (requestLogger: LoggerService) => <T, U extends any[]>(
    cb: (em: EntityManager, ...args: U) => Promise<T>,
  ) => {
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
          requestLogger.log(
            `transaction failed due to serialization failure, retrying...` +
              ` attemptNumber of last attempt was: ${attemptNumber}`,
            SERVICE_NAME,
          );
          attemptNumber++;
        }
      }
    };
  };
}
