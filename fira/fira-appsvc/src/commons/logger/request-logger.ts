import { Injectable, Scope } from '@nestjs/common';

import { LogContext } from './base-logger';
import { TransientLogger } from './transient-logger';
import { RequestProperties } from '../request-properties';
import { ObjectLiteral } from '../../../../fira-commons';

@Injectable({ scope: Scope.TRANSIENT })
export class RequestLogger {
  private readonly logContext: LogContext;

  constructor(
    private readonly transientLogger: TransientLogger,
    private readonly requestProperties: RequestProperties,
  ) {
    this.logContext = {
      clientId: this.requestProperties.getClientId(),
      inRequestId: this.requestProperties.getRequestId(),
    };
  }

  public setComponent(component: string): void {
    this.logContext.component = component;
  }

  public log(message: string, messageContext?: ObjectLiteral, logContext?: LogContext): void {
    this.transientLogger.log(message, messageContext, {
      ...this.logContext,
      ...logContext,
    });
  }

  public debug(message: string, messageContext?: ObjectLiteral, logContext?: LogContext): void {
    this.transientLogger.debug(message, messageContext, {
      ...this.logContext,
      ...logContext,
    });
  }

  public warn(message: string, messageContext?: ObjectLiteral, logContext?: LogContext): void {
    this.transientLogger.warn(message, messageContext, {
      ...this.logContext,
      ...logContext,
    });
  }

  public error(
    message: string,
    error?: any,
    messageContext?: ObjectLiteral,
    logContext?: LogContext,
  ): void {
    this.transientLogger.error(message, error, messageContext, {
      ...this.logContext,
      ...logContext,
    });
  }
}
