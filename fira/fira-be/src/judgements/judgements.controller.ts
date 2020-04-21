import {
  Controller,
  Post,
  Headers,
  UseGuards,
  Put,
  Param,
  Body,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';

import { JudgementsService } from './judgements.service';
import { PreloadJudgementsResponseDto } from './dto/preload-judgements.dto';
import { AuthGuard } from '../auth.guard';
import { SaveJudgementRequestDto } from './dto/save-judgement.dto';
import { extractJwtPayload } from '../util/jwt.util';

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
    @Req() request: Request,
  ): Promise<PreloadJudgementsResponseDto> {
    const jwtPayload = extractJwtPayload(authHeader);
    const worklet = this.judgementsService.addPreloadWorklet(jwtPayload.preferred_username);

    // if the connection aborts before the response promise is settled, remove the worklet
    let promiseSettled = false;
    // tslint:disable-next-line: no-floating-promises
    worklet.responsePromise.finally(() => (promiseSettled = true));
    request.on('close', () => {
      if (!promiseSettled) {
        this.judgementsService.removePreloadWorklet(worklet.workletId);
      }
    });

    return worklet.responsePromise;
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

    return await this.judgementsService.saveJudgement(
      jwtPayload.preferred_username,
      id,
      saveJudgementRequest,
    );
  }
}
