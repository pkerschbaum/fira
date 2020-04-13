import { ArgumentsHost, Catch, NotFoundException, HttpServer } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response, Request } from 'express';
import * as path from 'path';

import * as config from '../config';

// taken from https://github.com/nestjs/nest/issues/402
@Catch(NotFoundException)
export class RedirectClientFilter extends BaseExceptionFilter {
  constructor(applicationRef: HttpServer) {
    super(applicationRef);
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (req.path && req.path.startsWith(config.application.urlPaths.api)) {
      // API 404, serve default nest 404
      super.catch(exception, host);
    } else {
      // client access, let the SPA handle
      response.sendFile(path.join(config.application.staticSourcesPath, '.', 'index.html'));
    }
  }
}
