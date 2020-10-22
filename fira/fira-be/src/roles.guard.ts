import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import * as util from 'util';
import { Request } from 'express';

import { JwtPayload } from '../../commons';
import { IdentityManagementService } from './identity-management/identity-management.service';
import { DecoratorElems } from './roles.decorator';

const verify = util.promisify(jwt.verify);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly identityMgmtService: IdentityManagementService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<DecoratorElems[]>('roles', context.getClass());

    // if no roles are required (i.e., decorator is absent for the route), allow access
    if (!requiredRoles) {
      return true;
    }

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
    let jwtPayload: JwtPayload;
    try {
      jwtPayload = (await verify(accessToken, publicKey)) as JwtPayload;
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(`token expired, expired at: ${e.expiredAt}`);
      }
      throw new UnauthorizedException(`token not valid, error: ${e}`);
    }

    // check if one of the roles supplied by the decorator is present in the token
    return requiredRoles.some((requiredRole) => {
      return !!jwtPayload.resource_access?.[requiredRole.category]?.roles?.some(
        (actualRole) => actualRole === requiredRole.role,
      );
    });
  }
}
