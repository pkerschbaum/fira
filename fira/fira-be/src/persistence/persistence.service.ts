import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';

import { RequestLogger } from '../commons/logger/request-logger';
import { TransientLogger } from '../commons/logger/transient-logger';

const MAX_ATTEMPTS = 5;
const POSTGRES_SERIALIZATION_FAILURE_CODE = '40001';

let singletonGotInstantiated = false;

@Injectable()
export class PersistenceService {
  /** This service must have a singleton-scope, thus it is important to pay attention when
   * adding or changing dependencies of this service. See comment of constructor of
   * [judgements-worker.service.ts](fira-be/src/judgements/judgements-worker.service.ts) for
   * further details.
   */
  constructor(private readonly connection: Connection) {
    if (singletonGotInstantiated) {
      throw new Error(`this class should be a singleton and thus get instantiated only once`);
    }
    singletonGotInstantiated = true;
  }

  public wrapInTransaction = (requestLogger: TransientLogger | RequestLogger) => <
    T,
    U extends any[]
  >(
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
            undefined,
            { component: this.constructor.name },
          );
          attemptNumber++;
        }
      }
    };
  };
}
