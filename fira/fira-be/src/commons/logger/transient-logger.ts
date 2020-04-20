import { Injectable, Scope, LoggerService } from '@nestjs/common';
import { BaseLogger } from './base-logger';

@Injectable({ scope: Scope.TRANSIENT })
export class TransientLogger implements LoggerService {
  private context?: string;

  constructor(private readonly baseLogger: BaseLogger) {}

  error(message: any, trace?: string, context?: string): void {
    this.baseLogger.error(message, trace, context || this.context);
  }
  log(message: any, context?: string): void {
    this.baseLogger.log(message, context || this.context);
  }
  warn(message: any, context?: string): void {
    this.baseLogger.warn(message, context || this.context);
  }
  debug(message: any, context?: string): void {
    this.baseLogger.debug(message, context || this.context);
  }
  verbose(message: any, context?: string): void {
    this.baseLogger.verbose(message, context || this.context);
  }
  setContext(context: string): void {
    this.context = context;
  }
}
