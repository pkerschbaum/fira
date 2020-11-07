import {
  Controller,
  Post,
  Headers,
  UseGuards,
  Put,
  Param,
  Body,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

import { ZodValidationPipe } from '../commons/zod-schema-validation.pipe';
import { JudgementsService } from './judgements.service';
import { AuthGuard } from '../auth.guard';
import { extractJwtPayload } from '../utils/jwt.util';
import {
  basePaths,
  PreloadJudgements,
  preloadJudgementsSchema,
  SubmitJudgement,
  submitJudgementSchema,
} from '../../../fira-commons/src/rest-api';

const submitJudgementPathParam = 'judgementId' as const;

@ApiTags(basePaths.judgements)
@Controller(basePaths.judgements)
@ApiHeader({
  name: 'authorization',
  required: true,
})
@UseGuards(AuthGuard)
export class JudgementsController {
  constructor(private readonly judgementsService: JudgementsService) {}

  @Post(preloadJudgementsSchema.shape.request.shape.url._def.value)
  public async preloadJudgements(
    @Headers('authorization') authHeader: string,
  ): Promise<PreloadJudgements['response']> {
    const jwtPayload = extractJwtPayload(authHeader);
    return await this.judgementsService.preload(jwtPayload.preferred_username);
  }

  @Put(submitJudgementSchema.shape.request.shape.url._def.value)
  public async submitJudgement(
    @Body(new ZodValidationPipe(submitJudgementSchema.shape.request.shape.data))
    submitJudgementRequest: SubmitJudgement['request']['data'],
    @Param(submitJudgementPathParam, ParseIntPipe)
    judgementId: SubmitJudgement['request']['pathParams'][typeof submitJudgementPathParam],
    @Headers('authorization') authHeader: string,
  ): Promise<SubmitJudgement['response']> {
    const id: number = +judgementId;
    if (isNaN(id)) {
      throw new BadRequestException(
        `path parameter 'id' must be a number, but was: '${judgementId}'`,
      );
    }
    const jwtPayload = extractJwtPayload(authHeader);

    return await this.judgementsService.submitJudgement(
      jwtPayload.preferred_username,
      id,
      submitJudgementRequest,
    );
  }
}
