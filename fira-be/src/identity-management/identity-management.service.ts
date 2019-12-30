import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Moment } from 'moment';
import generate = require('nanoid/generate');

import * as config from '../config';
import { AppLogger } from '../logger/app-logger.service';
import { KeycloakClient } from './keycloak.client';

interface Cache {
  publicKey: {
    val?: string;
    lastFetchedOn?: Moment;
  };
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface ImportUserResponse {
  id: string;
  username?: string;
  password?: string;
  error?: string;
}

const SERVICE_NAME = 'IdentityManagementService';

@Injectable()
export class IdentityManagementService {
  private cache: Cache;

  constructor(
    private readonly keycloakClient: KeycloakClient,
    private readonly appLogger: AppLogger,
  ) {
    this.appLogger.setContext(SERVICE_NAME);
    this.cache = { publicKey: {} };
  }

  public async login(
    username: string,
    password: string,
  ): Promise<LoginResponse> {
    const loginResponse = await this.keycloakClient.login(username, password);

    return {
      accessToken: loginResponse.access_token,
      refreshToken: loginResponse.refresh_token,
    };
  }

  public async importUsers(
    accessToken: string,
    users: Array<{ id: string }>,
  ): Promise<ImportUserResponse[]> {
    return Promise.all(
      users.map(async user => {
        const password = generate(
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
          8,
        );

        try {
          await this.keycloakClient.createUser(accessToken, user.id, password);
          return { id: user.id, username: user.id, password };
        } catch (e) {
          return { id: user.id, error: e.toString() };
        }
      }),
    );
  }

  public async loadPublicKey() {
    try {
      if (
        !this.cache.publicKey.lastFetchedOn ||
        moment()
          .subtract(config.keycloak.refetchInterval)
          .isAfter(this.cache.publicKey.lastFetchedOn)
      ) {
        this.appLogger.log('fetching public key from keycloak');

        const keycloakCertsResponse = await this.keycloakClient.getPublicKey();

        const newKey = keycloakCertsResponse.keys?.[0]?.x5c?.[0];
        if (newKey) {
          this.appLogger.log(
            `could successfully retrieve public key from keycloak, value: ${newKey}`,
          );

          this.cache.publicKey.val = newKey;
          this.cache.publicKey.lastFetchedOn = moment();
        }
      }
    } catch (e) {
      this.appLogger.warn(
        `could not retrieve new key from keycloak, reason: ${e}`,
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
