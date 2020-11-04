import * as Knex from 'knex';

export type KnexClient = ReturnType<typeof Knex>;
export const KNEX_CLIENT = Symbol(`knex-client`);
