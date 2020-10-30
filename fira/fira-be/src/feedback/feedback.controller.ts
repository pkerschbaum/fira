import { Controller, UseGuards, Post, Headers, Body } from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

import { AuthGuard } from '../auth.guard';
import { FeedbackService } from './feedback.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { extractJwtPayload } from '../utils/jwt.util';

@ApiTags('feedback')
@Controller('feedback')
@ApiHeader({
  name: 'authorization',
  required: true,
})
@UseGuards(AuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('v1')
  public async submitFeedback(
    @Body() submitFeedbackRequest: SubmitFeedbackDto,
    @Headers('authorization') authHeader: string,
  ): Promise<void> {
    const jwtPayload = extractJwtPayload(authHeader);
    return this.feedbackService.submitFeedback(
      jwtPayload.preferred_username,
      submitFeedbackRequest,
    );
  }
}
