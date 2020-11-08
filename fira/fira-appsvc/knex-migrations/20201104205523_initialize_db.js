/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const sqlScriptUp = fs.readFileSync(path.join(__dirname, './20201104205523_initialize_up.sql'), {
  encoding: 'utf-8',
});

exports.up = async function (knex) {
  await knex.raw(sqlScriptUp);
};

exports.down = function () {
  throw new Error(`not implemented`);
};
