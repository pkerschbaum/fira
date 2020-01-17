import {
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  UseGuards,
  Put,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

import { JwtPayload } from '../typings/commons';
import { JudgementsService } from './judgements.service';
import { PreloadJudgementsResponseDto } from './dto/preload-judgements.dto';
import { AuthGuard } from 'src/auth.guard';
import { SaveJudgementRequestDto } from './dto/save-judgement.dto';

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
    const jwtPayload = extractJwtPayload(authHeader);

    // preload judgements
    return await this.judgementsService.preloadJudgements(jwtPayload.preferred_username);
  }

  @Put('v1/:id')
  async saveJudgement(
    @Body() saveJudgementRequest: SaveJudgementRequestDto,
    @Param('id') judgementId: string,
    @Headers('authorization') authHeader: string,
  ): Promise<void> {
    const id: number = +judgementId;
    if (isNaN(id)) {
      throw new BadRequestException(
        `path parameter 'id' must be a number, but was: '${judgementId}'`,
      );
    }
    const jwtPayload = extractJwtPayload(authHeader);

    // preload judgements
    return await this.judgementsService.saveJudgement(
      jwtPayload.preferred_username,
      id,
      saveJudgementRequest,
    );
  }
}

function extractJwtPayload(authHeader: string): JwtPayload & { preferred_username: string } {
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
