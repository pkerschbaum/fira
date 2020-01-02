import {
  Controller,
  Post,
  Headers,
  ForbiddenException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

import { JudgementsService } from './judgements.service';
import { PreloadJudgementsResponseDto } from './dto/preload-judgements.dto';
import { AuthGuard } from 'src/auth.guard';

interface JwtPayload {
  preferred_username?: string;
}

@ApiTags('judgements')
@Controller('judgements')
@ApiHeader({
  name: 'authorization',
  required: true,
})
@UseGuards(AuthGuard)
export class JudgementsController {
  constructor(private readonly judgementsService: JudgementsService) {}

  @Post('v1/preload')
  async preloadJudgements(
    @Headers('authorization') authHeader: string,
  ): Promise<PreloadJudgementsResponseDto> {
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

    // preload judgements
    return {
      judgements: await this.judgementsService.preloadJudgements(
        jwtPayload.preferred_username,
      ),
    };
  }
}
