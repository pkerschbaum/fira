import { Injectable, Scope } from '@nestjs/common';
import { AppLogger } from './app-logger.service';
import { RequestProperties } from './request-properties.service';

@Injectable({ scope: Scope.TRANSIENT })
export class RequestLogger {
  constructor(private appLogger: AppLogger, private requestProperties: RequestProperties) {
    this.appLogger = new AppLogger();
  }

  public setContext(context: string): void {
    this.appLogger.setContext(context);
  }

  public log(message: any, context?: string): void {
    this.appLogger.log(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context,
    );
  }

  public debug(message: any, context?: string): void {
    this.appLogger.debug(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context,
    );
  }

  public warn(message: any, context?: string): void {
    this.appLogger.warn(
      `[client-id=${this.requestProperties.getClientId()}] [request-id=${this.requestProperties.getRequestId()}] ${message}`,
      context,
    );
  }
}
