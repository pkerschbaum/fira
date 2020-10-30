# Fira-Commons

This module contains shared code for `fira-web` and `fira-be`.  
Furthermore, the database schema is defined here.

The migration files are located in the folder [`database`](database/).  
[`knex.js` migrations](http://knexjs.org/#Migrations) are used to bootstrap and update the database schema.

`fira-be` uses [Prisma](https://www.prisma.io/docs/) as the database client. The [schema file `schema.prisma`](prisma/schema.prisma) is equivalent to the database schema bootstrapped by the knex migrations. If the database schema changes, one can use `npx prisma introspect` to re-generate the schema.prisma file, so that it reflects the current database schema.

## How-To: Bootstrap database

1. `npm install`
2. Copy the file [`sample/.env`](sample/.env) to [`/.env`](/.env) (i.e., the root of the `fira-commons` directory). Set the appropriate values for the variables:
   1. Set `NODE_ENV=development` for the development environment or `NODE_ENV=production` for the production environment.
   2. Set `FIRA_PERSISTENT_DB_URL` as a postgres connection string.
3. `cd database`
4. `npx knex migrate:up`

## How-To: Update database schema

1. Implement new migration file. See [`database/migrations/20200817182054_initialize.js`](database/migrations/20200817182054_initialize.js) as reference.
2. `cd database`
3. `npx knex migrate:up`

## How-To: Update Prisma schema

1. Put the `.env` file created in [How-To: Bootstrap database](#how-to-bootstrap-database) to [`prisma/.env`](prisma/.env).
2. Make sure the current working directory of the command line is in `fira-commons`
3. `npx prisma introspect`
   - This command should connect to the database and update the file [`schema.prisma`](prisma/schema.prisma).
4. `npx prisma generate`
