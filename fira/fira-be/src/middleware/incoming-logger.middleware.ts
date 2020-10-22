import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

import { RequestLogger } from '../commons/logger/request-logger';

const CONTEXT_NAME = 'IncomingLoggerMiddleware';

@Injectable()
export class IncomingLoggerMiddleware implements NestMiddleware {
  constructor(private readonly requestLogger: RequestLogger) {
    this.requestLogger.setContext(CONTEXT_NAME);
  }

  use(req: Request, res: Response, next: () => void) {
    try {
      const incomingTimestamp = Date.now();
      this.requestLogger.log(
        `[REQUEST INCOMING] originalUrl=${req.originalUrl} method=${
          req.method
        } content-length=${req.get('content-length')}`,
      );

      const finishResponse = afterResponse('finish');
      const closeResponse = afterResponse('close');
      const requestLogger = this.requestLogger;

      function afterResponse(event: 'finish' | 'close') {
        return () => {
          const requestGotCancelled = event === 'close';

          try {
            res.removeListener('finish', finishResponse);
            res.removeListener('close', closeResponse);
            if (!requestGotCancelled) {
              requestLogger.log(
                `[RESPONSE OUTGOING] statuscode=${res.statusCode} content-length=${res.get(
                  'content-length',
                )} duration=${Date.now() - incomingTimestamp}ms`,
              );
            } else {
              requestLogger.log(`[REQUEST GOT CANCELLED]`);
            }
          } catch {
            // ignore
          }
        };
      }

      res.on('finish', finishResponse);
      res.on('close', closeResponse);
    } catch {
      // ignore
    }
    next();
  }
}
