import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { JwtPayload } from '../../../fira-commons';

export function extractJwtPayload(authHeader: string): JwtPayload & { preferred_username: string } {
  const accessToken = /Bearer (.+)/.exec(authHeader)?.[1]!; // AuthGuard ensures that the token is present

  // extract jwt data
  let jwtPayload: JwtPayload;
  try {
    jwtPayload = jwt.decode(accessToken) as JwtPayload;
  } catch (e) {
    throw new UnauthorizedException(`token not parsable, error: ${e}`);
  }
  if (!jwtPayload.preferred_username) {
    throw new UnauthorizedException(`no preferred_username found in token`);
  }
  return jwtPayload as JwtPayload & { preferred_username: string };
}
