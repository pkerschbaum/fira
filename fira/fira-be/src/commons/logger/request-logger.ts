import { Injectable, Scope, LoggerService, Inject } from '@nestjs/common';
import { TransientLogger } from './transient-logger';
import { RequestProperties } from '../request-properties';

@Injectable({ scope: Scope.TRANSIENT })
export class RequestLogger implements LoggerService {
  private context?: string;

  constructor(
    private readonly transientLogger: TransientLogger,
    private readonly requestProperties: RequestProperties,
  ) {}

  public setContext(context: string): void {
    this.context = context;
  }

  public log(message: any, context?: string): void {
    this.transientLogger.log(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context ?? this.context,
    );
  }

  public debug(message: any, context?: string): void {
    this.transientLogger.debug(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context ?? this.context,
    );
  }

  public warn(message: any, context?: string): void {
    this.transientLogger.warn(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context ?? this.context,
    );
  }

  public error(message: any, context?: string): void {
    this.transientLogger.error(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context ?? this.context,
    );
  }
}
