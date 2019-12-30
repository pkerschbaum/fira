import * as moment from 'moment';

export const application = {
  port: 80,
  rateLimit: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // limit each IP to 200 requests per windowMs
  },
} as const;

export const keycloak = {
  host: {
    protocol: 'http',
    base: 'localhost:8080',
  },
  refetchInterval: moment.duration(1, 'day'),
  clientId: 'fira-be',
  realm: 'fira',
} as const;
