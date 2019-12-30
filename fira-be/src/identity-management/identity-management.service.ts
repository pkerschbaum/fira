import { HttpService, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Moment } from 'moment';

import { AppLogger } from 'src/logger/app-logger.service';
import * as config from 'src/config';

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

@Injectable()
export class IdentityManagementService {
  private cache: Cache;

  constructor(
    private readonly httpService: HttpService,
    private readonly appLogger: AppLogger,
  ) {
    this.cache = { publicKey: {} };
  }

  public async loadPublicKey() {
    try {
      if (
        !this.cache.publicKey.lastFetchedOn ||
        moment()
          .subtract(config.keycloak.refetchInterval)
          .isAfter(this.cache.publicKey.lastFetchedOn)
      ) {
        this.appLogger.log('fetching public key from keycloak', SERVICE_NAME);

        const keycloakCertsResponse = (
          await this.httpService
            .get<KeycloakCertsResponse>(
              `${config.keycloak.host.protocol}://${config.keycloak.host.base}/auth/realms/fira/protocol/openid-connect/certs`,
            )
            .toPromise()
        ).data;

        const newKey = keycloakCertsResponse.keys?.[0]?.x5c?.[0];
        if (newKey) {
          this.appLogger.log(
            `could successfully retrieve public key from keycloak, value: ${newKey}`,
            SERVICE_NAME,
          );

          this.cache.publicKey.val = newKey;
          this.cache.publicKey.lastFetchedOn = moment();
        }
      }
    } catch (e) {
      this.appLogger.warn(
        `could not retrieve new key from keycloak, reason: ${e}`,
        SERVICE_NAME,
      );
    }

    if (!this.cache.publicKey.val) {
      throw new Error(
        'could not determine public key, reason: public key is not set in cache',
      );
    }

    return this.cache.publicKey.val;
  }
}
