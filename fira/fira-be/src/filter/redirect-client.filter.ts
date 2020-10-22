import { ArgumentsHost, Catch, NotFoundException, HttpServer } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response, Request } from 'express';
import * as path from 'path';

import * as config from '../config';

// taken from https://github.com/nestjs/nest/issues/402
// define a filter which will serve index.html of the web app for every request, except when it starts
// with the urlPaths.api prefix. In that case, the request should be handled by an HTTP endpoint.
// Serving index.html is sufficient since the single page application will handle further routing on the client side
@Catch(NotFoundException)
export class RedirectClientFilter extends BaseExceptionFilter {
  constructor(applicationRef: HttpServer) {
    super(applicationRef);
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (
      req.path &&
      req.path.startsWith(`${config.application.urlPaths.web}${config.application.urlPaths.api}`)
    ) {
      // API 404, serve default nest 404
      super.catch(exception, host);
    } else {
      // client access, let the SPA handle
      response.sendFile(path.join(config.application.staticSourcesPath, '.', 'index.html'));
    }
  }
}
