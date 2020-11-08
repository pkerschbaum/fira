import * as moment from 'moment';
import * as path from 'path';
import * as dotenv from 'dotenv';

// load .env file of project root (for local development)
dotenv.config();

// URL_REGEX taken from https://stackoverflow.com/a/26766402/1700319
const URL_REGEX = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

export const application = {
  version: '1.6.5',
  port: 80,
  judgementsPreloadSize: 3,
  splitRegex: /([ .\-,;]+?)/g,
  environment: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  urlPaths: {
    homepage: process.env.FIRA_HOMEPAGE ?? 'http://localhost:3000',
    // extract path of URL via regex, e.g. "/path1/path2" from "http://localhost/path1/path2"
    web:
      (process.env.FIRA_HOMEPAGE === undefined
        ? undefined
        : URL_REGEX.exec(process.env.FIRA_HOMEPAGE)?.[5]) ?? '',
    api: '/api',
  },
  staticSourcesPath: path.join(__dirname, '..', 'client', 'build'),
} as const;

export const database: { connectionString: string } = {
  connectionString: process.env.FIRA_PERSISTENT_DB_URL ?? ``,
} as const;

export const keycloak = {
  host: {
    protocol: 'http',
    base: process.env.KEYCLOAK_HOST_BASE ?? 'localhost:8077',
  },
  refetchInterval: moment.duration(1, 'day'),
  clientId: 'fira-be',
  realm: 'fira',
  adminRole: { category: 'realm-management', role: 'manage-users' },
  adminCredentials: {
    username: process.env.KEYCLOAK_ADMIN_USER ?? 'admin',
    password: process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin',
  },
} as const;
