This project uses [Nest](https://github.com/nestjs/nest), a progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.

## Installation

```bash
$ npm install
```

Create a `.env` file in the root directory of fira-appsvc (i.e., next to this readme) with the following content:

```properties
NODE_ENV=development
FIRA_PERSISTENT_DB_URL=postgresql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
