import { Injectable, HttpService } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import { TransientLogger } from './logger/transient-logger';
import { RequestLogger } from './logger/request-logger';
import { uniqueIdGenerator, strings } from '../../../fira-commons';

/* method mandatory */
export type RequestConfig = AxiosRequestConfig & { method: Pick<AxiosRequestConfig, 'method'> };
export type Request = {
  request: RequestConfig;
  exceptionHandlers?: ExceptionHandler[];
  requestLogger?: RequestLogger;
};
type ExceptionHandler = {
  condition: (error: any) => boolean;
  exception: (error: any) => Error;
};

let singletonGotInstantiated = false;

@Injectable()
export class AppHttpClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly transientLogger: TransientLogger,
  ) {
    if (singletonGotInstantiated) {
      throw new Error(`class must be a singleton`);
    }
    singletonGotInstantiated = true;
  }

  public async request<T>({ request, exceptionHandlers, requestLogger }: Request) {
    const logger = requestLogger ?? this.transientLogger;
    const outRequestId = uniqueIdGenerator.generate();
    const logContext = { component: this.constructor.name, outRequestId };

    // log request (fail-safe)
    try {
      logger.log(
        `REQUEST OUTGOING`,
        { method: request.method.toUpperCase(), url: request.url },
        logContext,
      );
      const payload = request.data ?? request.params;
      if (payload !== undefined) {
        const dataString = JSON.stringify(payload);
        if (/.*password.*/i.test(dataString)) {
          logger.debug(
            `REQUEST OUTGOING PAYLOAD <payload omitted because of sensitive data>`,
            undefined,
            logContext,
          );
        } else {
          logger.debug(`REQUEST OUTGOING PAYLOAD`, { dataString }, logContext);
        }
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
        logger.log(`RESPONSE INCOMING`, { responseStatus }, logContext);
        if (typeof responseData !== 'string' || !strings.isNullishOrEmpty(responseData)) {
          logger.debug(
            `RESPONSE INCOMING PAYLOAD`,
            { responseData: JSON.stringify(responseData) },
            logContext,
          );
        }
      } catch {
        // ignore
      }
    }
  }
}
