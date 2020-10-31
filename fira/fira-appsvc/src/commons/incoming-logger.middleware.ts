import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

import { RequestLogger } from './logger/request-logger';

@Injectable()
export class IncomingLoggerMiddleware implements NestMiddleware {
  constructor(private readonly requestLogger: RequestLogger) {
    this.requestLogger.setComponent(this.constructor.name);
  }

  public use(req: Request, res: Response, next: () => void) {
    try {
      const incomingTimestamp = Date.now();
      const contentLength = req.get('content-length');
      this.requestLogger.log(`REQUEST INCOMING`, {
        method: req.method,
        originalUrl: req.originalUrl,
        contentLength,
      });

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
              const durationMs = Date.now() - incomingTimestamp;
              const contentLength = res.get('content-length');
              requestLogger.log(`RESPONSE OUTGOING`, {
                statusCode: res.statusCode,
                contentLength,
                durationMs,
              });
            } else {
              requestLogger.log(`REQUEST GOT CANCELLED`);
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
