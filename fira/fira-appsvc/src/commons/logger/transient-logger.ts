import { Injectable, Scope } from '@nestjs/common';

import { baseLogger, LogContext } from './base-logger';
import { ObjectLiteral } from '../../../../fira-commons';

@Injectable({ scope: Scope.TRANSIENT })
export class TransientLogger {
  private component?: string;

  public setComponent(component: string): void {
    this.component = component;
  }

  public log(message: string, messageContext?: ObjectLiteral, logContext?: LogContext): void {
    baseLogger.log(message, messageContext, { component: this.component, ...logContext });
  }

  public debug(message: string, messageContext?: ObjectLiteral, logContext?: LogContext): void {
    baseLogger.debug(message, messageContext, { component: this.component, ...logContext });
  }

  public warn(message: string, messageContext?: ObjectLiteral, logContext?: LogContext): void {
    baseLogger.warn(message, messageContext, { component: this.component, ...logContext });
  }

  public error(
    message: string,
    error?: any,
    messageContext?: ObjectLiteral,
    logContext?: LogContext,
  ): void {
    baseLogger.error(message, error, messageContext, { component: this.component, ...logContext });
  }

  public clone(): TransientLogger {
    const clonedLogger = new TransientLogger();
    clonedLogger.component = this.component;
    return clonedLogger;
  }
}
