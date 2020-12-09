import * as Knex from 'knex';

import { ObjectLiteral } from '@fira-commons';

export function failIfUndefined<T, U extends any[]>(cb: (...args: U) => Promise<T | undefined>) {
  return async function f(this: any, ...args: U) {
    const result = await cb.apply(this, args);
    if (result === undefined) {
      throw new Error(`entity not found`);
    }
    return result;
  };
}

export function failIfNull<T, U extends any[]>(cb: (...args: U) => Promise<T | null>) {
  return async function f(this: any, ...args: U) {
    const result = await cb.apply(this, args);
    if (result === null) {
      throw new Error(`entity not found`);
    }
    return result;
  };
}

export function transactional<T, U extends ObjectLiteral>(
  cb: (obj: U, trx: Knex.Transaction) => T,
) {
  return function cbWithClient(obj: U, trx: Knex.Transaction) {
    return cb(obj, trx);
  };
}
