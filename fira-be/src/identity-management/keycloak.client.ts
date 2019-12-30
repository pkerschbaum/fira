import { HttpService, Injectable, HttpException } from '@nestjs/common';
import qs = require('qs');

import * as config from '../config';

interface KeycloakCertsResponse {
  keys?: [
    {
      n: string;
      e: string;
    },
  ];
}

interface KeycloakLoginResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class KeycloakClient {
  constructor(private readonly httpService: HttpService) {}

  public async getPublicKey() {
    return (
      await this.httpService
        .get<KeycloakCertsResponse>(
          `${getEndpoint()}/protocol/openid-connect/certs`,
        )
        .toPromise()
    ).data;
  }

  public async login(username: string, password: string) {
    const requestBody = {
      grant_type: 'password',
      client_id: config.keycloak.clientId,
      username,
      password,
    };

    try {
      return (
        await this.httpService
          .post<KeycloakLoginResponse>(
            `${getEndpoint()}/protocol/openid-connect/token`,
            qs.stringify(requestBody),
            {
              headers: {
                'content-type':
                  'application/x-www-form-urlencoded;charset=utf-8',
              },
            },
          )
          .toPromise()
      ).data;
    } catch (e) {
      if (e.response?.status === 401) {
        throw new HttpException('credentials invalid', 401);
      }
      throw e;
    }
  }

  public async createUser(
    accessToken: string,
    username: string,
    password: string,
  ) {
    const requestBody = {
      username,
      enabled: 'true',
      credentials: [
        {
          temporary: false,
          type: 'password',
          value: password,
        },
      ],
    };

    try {
      await this.httpService
        .post(
          `${getAdminEndpoint()}/users`,
          requestBody,
          {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .toPromise();
    } catch (e) {
      if (e.response?.status === 401) {
        throw new HttpException('credentials invalid', 401);
      }
      throw e;
    }
  }
}

function getEndpoint(): string {
  return `${config.keycloak.host.protocol}://${config.keycloak.host.base}/auth/realms/${config.keycloak.realm}`;
}

function getAdminEndpoint(): string {
  return `${config.keycloak.host.protocol}://${config.keycloak.host.base}/auth/admin/realms/${config.keycloak.realm}`;
}
