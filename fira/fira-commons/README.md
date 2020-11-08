# Fira-Commons

This module contains shared code for `fira-web` and `fira-appsvc`.  
Furthermore, the database schema is defined here.

`fira-appsvc` uses [Prisma](https://www.prisma.io/docs/) as the database client. The [schema file `schema.prisma`](prisma/schema.prisma) is equivalent to the database schema bootstrapped by `fira-appsvc`. If the database schema changes, one can use `npx prisma introspect` to re-generate the schema.prisma file, so that it reflects the current database schema.

## How-To: Update Prisma schema

1. Put the `.env` file created in [How-To: Bootstrap database](#how-to-bootstrap-database) to [`prisma/.env`](prisma/.env).
2. Make sure the current working directory of the command line is in `fira-commons`
3. `npx prisma introspect`
   - This command should connect to the database and update the file [`schema.prisma`](prisma/schema.prisma).
4. `npx prisma generate`
