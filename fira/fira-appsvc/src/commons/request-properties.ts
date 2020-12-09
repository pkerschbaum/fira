import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { HEADER_CLIENT_ID, HEADER_REQUEST_ID } from '@fira-commons';

@Injectable({ scope: Scope.REQUEST })
export class RequestProperties {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  public getClientId(): string | undefined {
    try {
      return this.request.get(HEADER_CLIENT_ID);
    } catch {
      // ignore
    }
  }

  public getRequestId(): string | undefined {
    try {
      return this.request.get(HEADER_REQUEST_ID);
    } catch {
      // ignore
    }
  }
}
