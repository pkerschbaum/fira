import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Repository } from 'typeorm';

import * as config from '../config';
import {
  AuthResponse,
  ImportUserResponse,
  ImportUserRequest,
  uniqueIdGenerator,
} from '../../../commons';
import { ImportStatus } from '../typings/enums';
import { RequestLogger } from '../commons/request-logger.service';
import { KeycloakClient } from './keycloak.client';
import { convertKey } from '../util/keys.util';
import { User } from './entity/user.entity';

const SERVICE_NAME = 'IdentityManagementService';

type Cache = {
  publicKey: {
    val?: string;
    lastFetchedOn?: Moment;
  };
};

const cache: Cache = { publicKey: {} };

@Injectable()
export class IdentityManagementService {
  constructor(
    private readonly keycloakClient: KeycloakClient,
    private readonly requestLogger: RequestLogger,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.requestLogger.setContext(SERVICE_NAME);
  }

  public login = async (username: string, password: string): Promise<AuthResponse> => {
    const loginResponse = await this.keycloakClient.login(username, password);

    return {
      accessToken: loginResponse.access_token,
      refreshToken: loginResponse.refresh_token,
    };
  };

  public refresh = async (refreshToken: string): Promise<AuthResponse> => {
    const refreshResponse = await this.keycloakClient.refresh(refreshToken);

    return {
      accessToken: refreshResponse.access_token,
      refreshToken: refreshResponse.refresh_token,
    };
  };

  public importUsers = async (
    accessToken: string,
    users: ImportUserRequest[],
  ): Promise<ImportUserResponse[]> => {
    return Promise.all(
      users.map(async (user) => {
        const password = uniqueIdGenerator.generate({
          alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
          size: 8,
        });

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
  };

  public loadPublicKey = async () => {
    try {
      if (
        !cache.publicKey.lastFetchedOn ||
        moment().subtract(config.keycloak.refetchInterval).isAfter(cache.publicKey.lastFetchedOn)
      ) {
        this.requestLogger.log('fetching public key from keycloak');

        const keycloakCertsResponse = await this.keycloakClient.getPublicKey();

        const newKey = keycloakCertsResponse.keys?.[0];
        if (newKey) {
          this.requestLogger.log(
            `could successfully retrieve public key from keycloak, converting and saving key...`,
          );
          cache.publicKey.val = convertKey(newKey);
          cache.publicKey.lastFetchedOn = moment();
          this.requestLogger.log(`could successfully convert and save public key`);
        }
      }
    } catch (e) {
      this.requestLogger.warn(`could not retrieve new key from keycloak, reason: ${e}`);
    }

    if (!cache.publicKey.val) {
      throw new Error('could not determine public key, reason: public key is not set in cache');
    }

    return cache.publicKey.val;
  };

  public getCountOfUsers = async (): Promise<number> => {
    return this.userRepository.count();
  };
}
