import { Injectable, Scope, Inject, Optional } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { HEADER_CLIENT_ID } from '../../../commons';

export const CUSTOM_PROP_SYMBOL = Symbol('custom-properties');
export type ExtendedRequest = Request & { [CUSTOM_PROP_SYMBOL]?: { requestId?: string } };

@Injectable({ scope: Scope.REQUEST })
export class RequestProperties {
  constructor(@Inject(REQUEST) private request: ExtendedRequest) {}

  public getClientId(): string | undefined {
    try {
      return this.request.get(HEADER_CLIENT_ID);
    } catch {
      // ignore
    }
  }

  public getRequestId(): string | undefined {
    try {
      return this.request[CUSTOM_PROP_SYMBOL]?.requestId;
    } catch {
      // ignore
    }
  }
}
