import * as moment from 'moment';

export const application = {
  port: 80 as const,
};

export const keycloak = {
  host: {
    protocol: 'http',
    base: 'localhost:8080',
  } as const,
  refetchInterval: moment.duration(1, 'day'),
  clientId: 'fira-be' as const,
  realm: 'fira' as const,
};
