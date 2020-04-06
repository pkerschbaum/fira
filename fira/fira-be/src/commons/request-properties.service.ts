import { Injectable, Scope, Inject, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { HEADER_CLIENT_ID } from '../../../commons';

@Injectable({ scope: Scope.REQUEST })
export class RequestProperties {
  constructor(@Inject(REQUEST) private request: Request) {}

  public getClientId(): string | undefined {
    return this.request.get(HEADER_CLIENT_ID);
  }
}
