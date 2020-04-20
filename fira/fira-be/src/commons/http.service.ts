import { Injectable, Scope, HttpService } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import { RequestLogger } from './logger/request-logger';
import { uniqueIdGenerator } from '../../../commons';

const SERVICE_NAME = 'HttpService';

@Injectable({ scope: Scope.REQUEST })
export class AppHttpService {
  constructor(
    private readonly httpService: HttpService,
    private readonly requestLogger: RequestLogger,
  ) {
    this.requestLogger.setContext(SERVICE_NAME);
  }

  async request<T>(
    /* method mandatory */
    requestConfig: AxiosRequestConfig & { method: Pick<AxiosRequestConfig, 'method'> },
  ) {
    const requestId = uniqueIdGenerator.generate();

    // log request
    try {
      this.requestLogger.log(
        `[REQUEST OUTGOING] [request-id=${requestId}] ${requestConfig.method?.toUpperCase()} ${
          requestConfig.url
        }`,
      );
      if (requestConfig.data) {
        this.requestLogger.debug(
          `[REQUEST OUTGOING PAYLOAD] [request-id=${requestId}] ${JSON.stringify(
            requestConfig.data,
          )}`,
        );
      }
    } catch {
      // ignore
    }

    // execute http request
    const response = await this.httpService.request<T>(requestConfig).toPromise();

    // log response
    try {
      this.requestLogger.log(`[RESPONSE INCOMING] [request-id=${requestId}] ${response.status}`);
      if (response.data) {
        this.requestLogger.debug(
          `[RESPONSE INCOMING PAYLOAD] [request-id=${requestId}] ${JSON.stringify(response.data)}`,
        );
      }
    } catch {
      // ignore
    }

    return response;
  }
}
