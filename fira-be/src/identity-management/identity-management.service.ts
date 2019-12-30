import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Moment } from 'moment';
import generate = require('nanoid/generate');

import * as config from '../config';
import { AppLogger } from '../logger/app-logger.service';
import { KeycloakClient } from './keycloak.client';
import { convertKey } from '../util/keys.util';
import { User } from './user/user.entity';
import { Repository } from 'typeorm';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
          const dbUser = new User();
          dbUser.id = user.id;
          await this.userRepository.save(dbUser);
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

        const newKey = keycloakCertsResponse.keys?.[0];
        if (newKey) {
          this.appLogger.log(
            `could successfully retrieve public key from keycloak, converting and saving key...`,
          );
          this.cache.publicKey.val = convertKey(newKey);
          this.cache.publicKey.lastFetchedOn = moment();
          this.appLogger.log(`could successfully convert and save public key`);
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
