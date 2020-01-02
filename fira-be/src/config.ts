import * as moment from 'moment';

export const application = {
  port: 80,
  rateLimit: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // limit each IP to 200 requests per windowMs
  },
  initialAnnotationTargetPerUser: 50,
  initialAnnotationTargetPerJudgPair: 10,
  splitRegex: /([ .\-,]+)/g,
} as const;

export const database = {
  type: 'postgres',
  host: process.env.DB_ADDR ?? 'localhost',
  port: 5432,
  username: process.env.DB_USER ?? 'fira',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'fira',
  synchronize: true,
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
} as const;
