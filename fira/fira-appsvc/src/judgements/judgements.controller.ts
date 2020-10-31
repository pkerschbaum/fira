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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';

import { ZodValidationPipe } from '../commons/zod-schema-validation.pipe';
import { JudgementsService } from './judgements.service';
import { AuthGuard } from '../auth.guard';
import { extractJwtPayload } from '../utils/jwt.util';
import {
  basePaths,
  PreloadJudgements,
  SubmitJudgement,
  submitJudgementSchema,
} from '../../../fira-commons/src/rest';

@ApiTags(basePaths.judgements)
@Controller(basePaths.judgements)
@ApiHeader({
  name: 'authorization',
  required: true,
})
@UseGuards(AuthGuard)
export class JudgementsController {
  constructor(private readonly judgementsService: JudgementsService) {}

  @Post('v1/preload')
  public async preloadJudgements(
    @Headers('authorization') authHeader: string,
    @Req() request: Request,
  ): Promise<PreloadJudgements['response']> {
    const jwtPayload = extractJwtPayload(authHeader);
    const result = await this.judgementsService.preload(jwtPayload.preferred_username);

    const workletId = result.workletId;
    if (workletId) {
      /*
       * at least one judgement must get preloaded using the worker.
       * thus, register a listener so that in case of a connection abort, the worklet gets removed from
       * the queue (but only if the response promise is not settled yet)
       */
      const closeHandler = () => {
        this.judgementsService.removePreloadWorklet(workletId);
        request.removeListener('close', closeHandler);
      };
      request.on('close', closeHandler);
      return result.responsePromise.finally(() => request.removeListener('close', closeHandler));
    }

    return result.responsePromise;
  }

  @Put('v1/:id')
  public async saveJudgement(
    @Body(new ZodValidationPipe(submitJudgementSchema.shape.request.shape.data))
    saveJudgementRequest: SubmitJudgement['request']['data'],
    @Param('id', ParseIntPipe) judgementId: SubmitJudgement['request']['pathParams']['judgementId'],
    @Headers('authorization') authHeader: string,
  ): Promise<SubmitJudgement['response']> {
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
