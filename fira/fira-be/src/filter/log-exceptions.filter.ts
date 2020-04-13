import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { RequestLogger } from '../commons/request-logger.service';

const SERVICE_NAME = 'LogExceptionsFilter';

@Catch()
export class LogExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly requestLogger: RequestLogger) {
    super();
    this.requestLogger.setContext(SERVICE_NAME);
  }

  catch(exception: any, host: ArgumentsHost) {
    try {
      this.requestLogger.warn(exception);
    } catch {
      // ignore
    } finally {
      super.catch(exception, host);
    }
  }
}
