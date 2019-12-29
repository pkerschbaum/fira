import { HttpService } from '@nestjs/common';
import * as moment from 'moment';
import { Moment } from 'moment';

import { AppLogger } from 'src/logger/app-logger.service';
import * as config from 'src/config';

export interface IdentityManagementService {
  loadPublicKey: () => Promise<string>;
}

interface Cache {
  publicKey: {
    val?: string;
    lastFetchedOn?: Moment;
  };
}

interface KeycloakCertsResponse {
  keys?: [
    {
      x5c?: string[];
    },
  ];
}

const SERVICE_NAME = 'IdentityManagementService';
const REFETCH_INTERVAL = moment.duration(1, 'day');

export function imServiceFactory(
  httpService: HttpService,
  appLogger: AppLogger,
): IdentityManagementService {
  const cache: Cache = { publicKey: {} };

  return {
    loadPublicKey: async () => {
      try {
        if (
          !cache.publicKey.lastFetchedOn ||
          moment()
            .subtract(REFETCH_INTERVAL)
            .isAfter(cache.publicKey.lastFetchedOn)
        ) {
          appLogger.log('fetching public key from keycloak', SERVICE_NAME);

          const keycloakCertsResponse = (
            await httpService
              .get<KeycloakCertsResponse>(
                `http://${config.hosts.keycloak.base}/auth/realms/fira/protocol/openid-connect/certs`,
              )
              .toPromise()
          ).data;

          const newKey = keycloakCertsResponse.keys?.[0]?.x5c?.[0];
          if (newKey) {
            appLogger.log(
              `could successfully retrieve public key from keycloak, value: ${newKey}`,
              SERVICE_NAME,
            );

            cache.publicKey.val = newKey;
            cache.publicKey.lastFetchedOn = moment();
          }
        }
      } catch (e) {
        appLogger.warn(
          `could not retrieve new key from keycloak, reason: ${e}`,
          SERVICE_NAME,
        );
      }

      if (!cache.publicKey.val) {
        throw new Error(
          'could not determine public key, reason: public key is not set in cache',
        );
      }

      return cache.publicKey.val;
    },
  };
}
