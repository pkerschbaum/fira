import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { RequestLogger } from '../commons/logger/request-logger';

@Catch()
export class LogExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly requestLogger: RequestLogger) {
    super();
    this.requestLogger.setComponent(this.constructor.name);
  }

  public catch(exception: any, host: ArgumentsHost) {
    try {
      this.requestLogger.warn(exception);
    } catch {
      // ignore
    } finally {
      super.catch(exception, host);
    }
  }
}
