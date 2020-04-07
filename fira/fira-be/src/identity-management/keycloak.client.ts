import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import qs = require('qs');

import * as config from '../config';
import { AppHttpService } from '../commons/http.service';

type KeycloakCertsResponse = {
  keys?: [
    {
      n: string;
      e: string;
    },
  ];
};

type KeycloakLoginRequest = {
  grant_type: 'password' | 'refresh_token';
  client_id: string;
  username?: string;
  password?: string;
  refresh_token?: string;
};

type KeycloakAuthResponse = {
  access_token: string;
  refresh_token: string;
};

@Injectable()
export class KeycloakClient {
  constructor(private readonly httpService: AppHttpService) {}

  public async getPublicKey() {
    return (
      await this.httpService.request<KeycloakCertsResponse>({
        url: `${getEndpoint()}/protocol/openid-connect/certs`,
      })
    ).data;
  }

  public async login(username: string, password: string) {
    try {
      return await this.getToken({
        grant_type: 'password',
        client_id: config.keycloak.clientId,
        username,
        password,
      });
    } catch (e) {
      if (e.response?.status === 401) {
        throw new UnauthorizedException('credentials invalid');
      }
      throw e;
    }
  }

  public async refresh(refreshToken: string) {
    try {
      return await this.getToken({
        grant_type: 'refresh_token',
        client_id: config.keycloak.clientId,
        refresh_token: refreshToken,
      });
    } catch (e) {
      if (e.response?.status === 401) {
        throw new UnauthorizedException('credentials invalid');
      } else if (e.response?.status === 403) {
        throw new ForbiddenException();
      } else if (e.response?.status === 400 && e.response?.data?.error === 'invalid_grant') {
        throw new UnauthorizedException('invalid token');
      }
      throw e;
    }
  }

  private async getToken(requestBody: KeycloakLoginRequest): Promise<KeycloakAuthResponse> {
    return (
      await this.httpService.request<KeycloakAuthResponse>({
        url: `${getEndpoint()}/protocol/openid-connect/token`,
        data: qs.stringify(requestBody),
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      })
    ).data;
  }

  public async createUser(accessToken: string, username: string, password: string) {
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
      await this.httpService.request({
        url: `${getAdminEndpoint()}/users`,
        data: requestBody,
        method: 'POST',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      if (e.response?.status === 401) {
        throw new UnauthorizedException('credentials invalid');
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
