import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as util from 'util';
import { Request } from 'express';

import { IdentityManagementService } from './identity-management/identity-management.service';

const verify = util.promisify(jwt.verify);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly identityMgmtService: IdentityManagementService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // extract JWT token from request
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.get('authorization');
    if (!authHeader) {
      throw new ForbiddenException();
    }
    const accessToken = /Bearer (.+)/.exec(authHeader)?.[1];
    if (!accessToken) {
      throw new ForbiddenException();
    }

    // get current public key and validate JWT token
    const publicKey = await this.identityMgmtService.loadPublicKey();
    try {
      await verify(accessToken, publicKey);
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(`token expired, expired at: ${e.expiredAt}`);
      }
      throw new UnauthorizedException(`token not valid, error: ${e}`);
    }

    // if token is valid, allow access
    return true;
  }
}
