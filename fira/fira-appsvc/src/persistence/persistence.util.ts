import { EntityManager, ObjectLiteral, Repository, ObjectType, EntitySchema } from 'typeorm';

export function failIfUndefined<T, U extends any[]>(cb: (...args: U) => Promise<T | undefined>) {
  return async function f(this: any, ...args: U) {
    const result = await cb.apply(this, args);
    if (result === undefined) {
      throw new Error(`entity not found`);
    }
    return result;
  };
}

export type DAO<Entity> = {
  readonly repository: Repository<Entity>;
};

export function optionalTransaction<Entity>(
  entity: ObjectType<Entity> | EntitySchema<Entity> | string,
) {
  return function f<T, U extends ObjectLiteral>(
    cb: (obj: U, repository: Repository<Entity>, transactionalEM?: EntityManager) => T,
  ) {
    return function cbWithRepo(this: DAO<Entity>, obj: U, transactionalEM?: EntityManager) {
      const ownRepository = this.repository;
      const repository =
        transactionalEM !== undefined ? transactionalEM.getRepository(entity) : ownRepository;

      return cb(obj, repository, transactionalEM);
    };
  };
}
