import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Moment } from 'moment';
import generate = require('nanoid/generate');
import { Repository } from 'typeorm';

import { AuthResponse, ImportUserResponse, ImportUserRequest } from './identity-management.types';
import { ImportStatus } from '../typings/enums';
import * as config from '../config';
import { AppLogger } from '../logger/app-logger.service';
import { KeycloakClient } from './keycloak.client';
import { convertKey } from '../util/keys.util';
import { User } from './entity/user.entity';

const SERVICE_NAME = 'IdentityManagementService';

export type Cache = {
  publicKey: {
    val?: string;
    lastFetchedOn?: Moment;
  };
};

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

  public async login(username: string, password: string): Promise<AuthResponse> {
    const loginResponse = await this.keycloakClient.login(username, password);

    return {
      accessToken: loginResponse.access_token,
      refreshToken: loginResponse.refresh_token,
    };
  }

  public async refresh(refreshToken: string): Promise<AuthResponse> {
    const refreshResponse = await this.keycloakClient.refresh(refreshToken);

    return {
      accessToken: refreshResponse.access_token,
      refreshToken: refreshResponse.refresh_token,
    };
  }

  public async importUsers(
    accessToken: string,
    users: Array<ImportUserRequest>,
  ): Promise<ImportUserResponse[]> {
    return Promise.all(
      users.map(async (user) => {
        const password = generate('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

        try {
          if ((await this.userRepository.findByIds([user.id])).length > 0) {
            return {
              id: user.id,
              status: ImportStatus.ERROR,
              error: 'User exists with same ID',
            };
          }

          await this.keycloakClient.createUser(accessToken, user.id, password);
          const dbUser = new User();
          dbUser.id = user.id;
          await this.userRepository.save(dbUser);
          return {
            id: user.id,
            status: ImportStatus.SUCCESS,
            username: user.id,
            password,
          };
        } catch (e) {
          return {
            id: user.id,
            status: ImportStatus.ERROR,
            error: e.toString(),
          };
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
      this.appLogger.warn(`could not retrieve new key from keycloak, reason: ${e}`);
    }

    if (!this.cache.publicKey.val) {
      throw new Error('could not determine public key, reason: public key is not set in cache');
    }

    return this.cache.publicKey.val;
  }

  public getCountOfUsers: () => Promise<number> = () => {
    return this.userRepository.count();
  };
}
