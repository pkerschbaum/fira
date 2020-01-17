import * as moment from 'moment';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import NamingStrategies = require('typeorm-naming-strategies');

import { JudgementMode } from './judgements/judgements.types';

export const application = {
  port: 80,
  rateLimit: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // limit each IP to 200 requests per windowMs
  },
  initialAnnotationTargetPerUser: 30,
  initialAnnotationTargetPerJudgPair: 10,
  judgementsPreloadSize: 3,
  judgementMode: JudgementMode.SCORING_AND_SELECT_SPANS,
  splitRegex: /([ .\-,]+)/g,
} as const;

export const database: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_ADDR ?? 'localhost',
  port: 5432,
  username: process.env.DB_USER ?? 'fira',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'fira',
  synchronize: true,
  namingStrategy: new NamingStrategies.SnakeNamingStrategy(),
} as const;

export const keycloak = {
  host: {
    protocol: 'http',
    base: 'localhost:8080',
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
