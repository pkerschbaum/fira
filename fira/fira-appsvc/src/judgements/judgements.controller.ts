import {
  Controller,
  Post,
  Headers,
  UseGuards,
  Put,
  Param,
  Body,
  ParseIntPipe,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

import { ZodValidationPipe } from '../commons/zod-schema-validation.pipe';
import { JudgementsService } from './judgements.service';
import { AuthGuard } from '../auth.guard';
import { extractJwtPayload } from '../utils/jwt.util';
import {
  basePaths,
  LoadJudgementByID,
  loadJudgementByIdSchema,
  LoadJudgementsOfUser,
  loadJudgementsOfUserSchema,
  PreloadJudgements,
  preloadJudgementsSchema,
  SubmitJudgement,
  submitJudgementSchema,
} from '../../../fira-commons/src/rest-api';

const judgementIdPathParam = 'judgementId' as const;

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

  @Get(loadJudgementsOfUserSchema.shape.request.shape.url._def.value)
  public async loadJudgementIDs(
    @Headers('authorization') authHeader: string,
    @Query(new ZodValidationPipe(loadJudgementsOfUserSchema.shape.request.shape.params))
    queryParams: LoadJudgementsOfUser['request']['params'],
  ): Promise<LoadJudgementsOfUser['response']> {
    const jwtPayload = extractJwtPayload(authHeader);
    return await this.judgementsService.loadJudgementsOfUser(jwtPayload.preferred_username, {
      skip: Number(queryParams.skip),
      take: Number(queryParams.take),
    });
  }

  @Get(loadJudgementByIdSchema.shape.request.shape.url._def.value)
  public async loadJudgementById(
    @Headers('authorization') authHeader: string,
    @Param(judgementIdPathParam, ParseIntPipe)
    judgementId: LoadJudgementByID['request']['pathParams'][typeof judgementIdPathParam],
  ): Promise<LoadJudgementByID['response']> {
    const jwtPayload = extractJwtPayload(authHeader);
    return await this.judgementsService.loadJudgement(jwtPayload.preferred_username, judgementId);
  }

  @Put(submitJudgementSchema.shape.request.shape.url._def.value)
  public async submitJudgement(
    @Body(new ZodValidationPipe(submitJudgementSchema.shape.request.shape.data))
    submitJudgementRequest: SubmitJudgement['request']['data'],
    @Param(judgementIdPathParam, ParseIntPipe)
    judgementId: SubmitJudgement['request']['pathParams'][typeof judgementIdPathParam],
    @Headers('authorization') authHeader: string,
  ): Promise<SubmitJudgement['response']> {
    const jwtPayload = extractJwtPayload(authHeader);

    return await this.judgementsService.submitJudgement(
      jwtPayload.preferred_username,
      judgementId,
      submitJudgementRequest,
    );
  }
}
