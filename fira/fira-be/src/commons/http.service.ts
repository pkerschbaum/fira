import { Injectable, Scope, HttpService } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import { RequestLogger } from './logger/request-logger';
import { uniqueIdGenerator } from '../../../commons';

export type RequestConfig = AxiosRequestConfig & { method: Pick<AxiosRequestConfig, 'method'> };
export type ExceptionHandler = {
  condition: (error: any) => boolean;
  exception: (error: any) => Error;
};

@Injectable({ scope: Scope.REQUEST })
export class AppHttpClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly requestLogger: RequestLogger,
  ) {
    this.requestLogger.setContext(this.constructor.name);
  }

  async request<T>({
    request,
    exceptionHandlers,
  }: {
    /* method mandatory */
    request: RequestConfig;
    exceptionHandlers?: ExceptionHandler[];
  }) {
    const requestId = uniqueIdGenerator.generate();

    // log request (fail-safe)
    try {
      this.requestLogger.log(
        `[REQUEST OUTGOING] [out-request-id=${requestId}] ${request.method?.toUpperCase()} ${
          request.url
        }`,
      );
      if (request.data) {
        this.requestLogger.debug(
          `[REQUEST OUTGOING PAYLOAD] [out-request-id=${requestId}] ${JSON.stringify(
            request.data,
          )}`,
        );
      }
    } catch {
      // ignore
    }

    // execute http request
    let responseStatus: number | undefined;
    let responseData: any;
    try {
      const response = await this.httpService.request<T>(request).toPromise();
      responseStatus = response.status;
      responseData = response.data;
      return response;
    } catch (e) {
      responseStatus = e.response?.status;
      responseData = e.response?.data;

      // apply exception handler, if matching handler found
      if (exceptionHandlers) {
        const handler = exceptionHandlers.find((handler) => handler.condition(e));
        if (handler) {
          throw handler.exception(e);
        }
      }
      throw e;
    } finally {
      // log response (fail-safe)
      try {
        this.requestLogger.log(
          `[RESPONSE INCOMING] [out-request-id=${requestId}] status=${responseStatus}`,
        );
        if (responseData) {
          this.requestLogger.debug(
            `[RESPONSE INCOMING PAYLOAD] [out-request-id=${requestId}] ${JSON.stringify(
              responseData,
            )}`,
          );
        }
      } catch {
        // ignore
      }
    }
  }
}
