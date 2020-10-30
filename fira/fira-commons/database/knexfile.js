// load .env file
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
require('dotenv').config({ path: require('find-config')('.env') });

module.exports = {
  development: {
    client: 'postgresql',
    connection: process.env.NODE_ENV === 'development' ? process.env.FIRA_PERSISTENT_DB_URL : '',
  },

  production: {
    client: 'postgresql',
    connection: process.env.NODE_ENV === 'production' ? process.env.FIRA_PERSISTENT_DB_URL : '',
  },
};
