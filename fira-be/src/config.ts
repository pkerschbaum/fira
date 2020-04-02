import * as moment from 'moment';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import NamingStrategies = require('typeorm-naming-strategies');

// URL_REGEX taken from https://stackoverflow.com/a/26766402/1700319
const URL_REGEX = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

export const application = {
  port: 80,
  rateLimit: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 500, // limit each IP to 200 requests per windowMs
  },
  judgementsPreloadSize: 3,
  splitRegex: /([ .\-,;]+?)/g,
  homepage: {
    path: (process.env.FIRA_HOMEPAGE && URL_REGEX.exec(process.env.FIRA_HOMEPAGE)![5]) ?? '',
  },
} as const;

export const database: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_ADDR ?? 'localhost',
  port: 5432,
  username: process.env.DB_USER ?? 'fira',
  password: process.env.DB_PASSWORD ?? 'password',
  database: 'fira',
  synchronize: true,
  namingStrategy: new NamingStrategies.SnakeNamingStrategy(),
} as const;

export const keycloak = {
  host: {
    protocol: 'http',
    base: process.env.KEYCLOAK_HOST_BASE ?? 'localhost:8080',
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
