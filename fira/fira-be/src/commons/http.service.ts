import { Injectable, Scope, HttpService } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import nanoid = require('nanoid');

import { RequestLogger } from './request-logger.service';

const ID_SIZE = 10;
const SERVICE_NAME = 'HttpService';

@Injectable({ scope: Scope.REQUEST })
export class AppHttpService {
  constructor(
    private readonly httpService: HttpService,
    private readonly requestLogger: RequestLogger,
  ) {
    this.requestLogger.setContext(SERVICE_NAME);
  }

  async request<T>(requestConfig: AxiosRequestConfig) {
    const requestId = nanoid(ID_SIZE);

    // log request
    try {
      this.requestLogger.log(
        `[REQUEST] [request-id=${requestId}] ${requestConfig.method?.toUpperCase()} ${
          requestConfig.url
        }`,
      );
      if (requestConfig.data) {
        this.requestLogger.debug(
          `[REQUEST PAYLOAD] [request-id=${requestId}] ${JSON.stringify(requestConfig.data)}`,
        );
      }
    } catch {
      // ignore
    }

    // execute http request
    const response = await this.httpService.request<T>(requestConfig).toPromise();

    // log response
    try {
      this.requestLogger.log(`[RESPONSE] [request-id=${requestId}] ${response.status}`);
      if (response.data) {
        this.requestLogger.debug(
          `[RESPONSE PAYLOAD] [request-id=${requestId}] ${JSON.stringify(response.data)}`,
        );
      }
    } catch {
      // ignore
    }

    return response;
  }
}
