import { Injectable, Scope } from '@nestjs/common';

import { AppHttpClient, Request } from './app-http-client';
import { RequestLogger } from './logger/request-logger';

@Injectable({ scope: Scope.REQUEST })
export class RequestHttpClient {
  constructor(
    private readonly appHttpClient: AppHttpClient,
    private readonly requestLogger: RequestLogger,
  ) {
    this.requestLogger.setComponent(this.constructor.name);
  }

  public request = async <T>(reqObj: Request) =>
    this.appHttpClient.request<T>({ ...reqObj, requestLogger: this.requestLogger });
}
