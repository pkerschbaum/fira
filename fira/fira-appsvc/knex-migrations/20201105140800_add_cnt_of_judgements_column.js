/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const sqlScriptUp = fs.readFileSync(
  path.join(__dirname, './20201105140800_add_cnt_of_judgements_column_up.sql'),
  {
    encoding: 'utf-8',
  },
);

const sqlScriptDown = fs.readFileSync(
  path.join(__dirname, './20201105140800_add_cnt_of_judgements_column_down.sql'),
  {
    encoding: 'utf-8',
  },
);

exports.up = async function (knex) {
  await knex.raw(sqlScriptUp);
};

exports.down = async function (knex) {
  await knex.raw(sqlScriptDown);
};
