import { Inject, Injectable } from '@nestjs/common';
import * as Knex from 'knex';

import { RequestLogger } from '../commons/logger/request-logger';
import { TransientLogger } from '../commons/logger/transient-logger';
import { KNEX_CLIENT, KnexClient } from './persistence.constants';

const MAX_ATTEMPTS = 5;
const POSTGRES_SERIALIZATION_FAILURE_CODE = '40001';

let singletonGotInstantiated = false;

@Injectable()
export class PersistenceService {
  /** This service must have a singleton-scope, thus it is important to pay attention when
   * adding or changing dependencies of this service. See comment of constructor of
   * [judgements-worker.service.ts](fira-appsvc/src/judgements/judgements-worker.service.ts) for
   * further details.
   */
  constructor(@Inject(KNEX_CLIENT) private readonly knexClient: KnexClient) {
    if (singletonGotInstantiated) {
      throw new Error(`this class should be a singleton and thus get instantiated only once`);
    }
    singletonGotInstantiated = true;
  }

  public wrapInTransaction = (requestLogger: TransientLogger | RequestLogger) => <
    T,
    U extends any[]
  >(
    cb: (trx: Knex.Transaction, ...args: U) => Promise<T>,
  ) => {
    return async (...args: U) => {
      let attemptNumber = 1;
      while (true) {
        try {
          return await this.knexClient.transaction(async (trx) => {
            await trx.raw('set transaction isolation level serializable');
            return cb(trx, ...args);
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
