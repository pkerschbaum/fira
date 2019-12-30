import { HttpService, Injectable } from '@nestjs/common';

import * as config from '../config';

interface KeycloakCertsResponse {
  keys?: [
    {
      x5c?: string[];
    },
  ];
}

@Injectable()
export class KeycloakClient {
  constructor(private readonly httpService: HttpService) {}

  public async getPublicKey() {
    return (
      await this.httpService
        .get<KeycloakCertsResponse>(
          `${config.keycloak.host.protocol}://${config.keycloak.host.base}/auth/realms/fira/protocol/openid-connect/certs`,
        )
        .toPromise()
    ).data;
  }
}
