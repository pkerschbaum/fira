import { Injectable, Scope, Inject, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

const HEADER_CLIENT_ID = 'fira-client-id';

@Injectable({ scope: Scope.REQUEST })
export class RequestProperties {
  constructor(@Inject(REQUEST) private request: Request) {}

  public getClientId(): string | undefined {
    return this.request.get(HEADER_CLIENT_ID);
  }
}
