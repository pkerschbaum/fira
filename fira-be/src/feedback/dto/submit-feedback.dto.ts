import { IsDefined, IsString, IsOptional, IsEnum } from 'class-validator';

import { SubmitFeedback, FeedbackScore } from '../feedback.types';

export class SubmitFeedbackDto implements SubmitFeedback {
  @IsDefined()
  @IsEnum(FeedbackScore)
  score: FeedbackScore;
  @IsString()
  @IsOptional()
  text?: string;
}
