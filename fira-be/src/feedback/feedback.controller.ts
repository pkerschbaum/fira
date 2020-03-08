import { Controller, UseGuards, Post, Headers, Body } from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

import { AuthGuard } from '../auth.guard';
import { FeedbackService } from './feedback.service';
import { SaveFeedbackDto } from './dto/save-feedback.dto';
import { extractJwtPayload } from '../util/jwt.util';

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
  async saveFeedback(
    @Body() saveFeedbackRequest: SaveFeedbackDto,
    @Headers('authorization') authHeader: string,
  ): Promise<void> {
    const jwtPayload = extractJwtPayload(authHeader);
    return this.feedbackService.saveFeedback(jwtPayload.preferred_username, saveFeedbackRequest);
  }
}
