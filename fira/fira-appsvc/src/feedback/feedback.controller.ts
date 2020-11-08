import { Controller, UseGuards, Post, Headers, Body } from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

import { ZodValidationPipe } from '../commons/zod-schema-validation.pipe';
import { AuthGuard } from '../auth.guard';
import { FeedbackService } from './feedback.service';
import { extractJwtPayload } from '../utils/jwt.util';
import {
  basePaths,
  submitFeedbackReqSchema,
  SubmitFeedback,
} from '../../../fira-commons/src/rest-api';

@ApiTags(basePaths.feedback)
@Controller(basePaths.feedback)
@ApiHeader({
  name: 'authorization',
  required: true,
})
@UseGuards(AuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post(submitFeedbackReqSchema.shape.request.shape.url._def.value)
  public async submitFeedback(
    @Body(new ZodValidationPipe(submitFeedbackReqSchema.shape.request.shape.data))
    submitFeedbackRequest: SubmitFeedback['request']['data'],
    @Headers('authorization') authHeader: string,
  ): Promise<SubmitFeedback['response']> {
    const jwtPayload = extractJwtPayload(authHeader);
    return this.feedbackService.submitFeedback(
      jwtPayload.preferred_username,
      submitFeedbackRequest,
    );
  }
}
