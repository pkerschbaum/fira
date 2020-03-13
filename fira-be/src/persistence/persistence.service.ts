import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';

@Injectable()
export class PersistenceService {
  constructor(private readonly connection: Connection) {}

  public wrapInTransaction<T, U extends any[]>(cb: (em: EntityManager, ...args: U) => Promise<T>) {
    return (...args: U) => {
      return this.connection.transaction('SERIALIZABLE', transactionalEntityManager => {
        return cb(transactionalEntityManager, ...args);
      });
    };
  }
}
