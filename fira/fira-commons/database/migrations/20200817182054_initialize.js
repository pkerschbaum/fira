/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const sqlScriptUp = fs.readFileSync(path.join(__dirname, './20200817182054_initialize_up.sql'), {
  encoding: 'utf-8',
});
const sqlScriptDown = fs.readFileSync(
  path.join(__dirname, './20200817182054_initialize_down.sql'),
  { encoding: 'utf-8' },
);

exports.up = async function (knex) {
  await knex.raw(sqlScriptUp);
};

exports.down = async function (knex) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error(
      `NODE_ENV is not "development". Dropping the database is not allowed. Aborting...`,
    );
  }
  await knex.raw(sqlScriptDown);
};
