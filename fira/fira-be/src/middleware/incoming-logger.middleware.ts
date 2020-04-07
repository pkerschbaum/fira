import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

import { RequestLogger } from '../commons/request-logger.service';
import { uniqueIdGenerator } from '../util/id-generator';
import { ExtendedRequest, CUSTOM_PROP_SYMBOL } from '../commons/request-properties.service';

const CONTEXT_NAME = 'IncomingLoggerMiddleware';

@Injectable()
export class IncomingLoggerMiddleware implements NestMiddleware {
  constructor(private readonly requestLogger: RequestLogger) {
    this.requestLogger.setContext(CONTEXT_NAME);
  }

  use(req: Request, res: Response, next: () => void) {
    try {
      const requestId = uniqueIdGenerator.generate();
      (req as ExtendedRequest)[CUSTOM_PROP_SYMBOL] = { requestId };
      this.requestLogger.log(
        `[REQUEST INCOMING] originalUrl=${req.originalUrl} method=${
          req.method
        } content-length=${req.get('content-length')}`,
      );

      const afterResponse = () => {
        try {
          res.removeListener('finish', afterResponse);
          res.removeListener('close', afterResponse);

          this.requestLogger.log(
            `[RESPONSE OUTGOING] statuscode=${res.statusCode} content-length=${res.get(
              'content-length',
            )}`,
          );
        } catch {
          // ignore
        }
      };

      res.on('finish', afterResponse);
      res.on('close', afterResponse);
    } catch {
      // ignore
    }
    next();
  }
}
