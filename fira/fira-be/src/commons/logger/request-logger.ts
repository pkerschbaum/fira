import { Injectable, Scope, LoggerService, Inject } from '@nestjs/common';
import { TransientLogger } from './transient-logger';
import { RequestProperties } from '../request-properties';

@Injectable({ scope: Scope.TRANSIENT })
export class RequestLogger implements LoggerService {
  constructor(
    private transientLogger: TransientLogger,
    private requestProperties: RequestProperties,
  ) {}

  public setContext(context: string): void {
    this.transientLogger.setContext(context);
  }

  public log(message: any, context?: string): void {
    this.transientLogger.log(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context,
    );
  }

  public debug(message: any, context?: string): void {
    this.transientLogger.debug(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context,
    );
  }

  public warn(message: any, context?: string): void {
    this.transientLogger.warn(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context,
    );
  }

  public error(message: any, context?: string): void {
    this.transientLogger.error(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context,
    );
  }
}
