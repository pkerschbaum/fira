import { IsDefined, IsString, IsOptional, IsEnum } from 'class-validator';

import { FeedbackScore, SubmitFeedback } from '../../../../commons';

export class SubmitFeedbackDto implements SubmitFeedback {
  @IsDefined()
  @IsEnum(FeedbackScore)
  score: FeedbackScore;
  @IsString()
  @IsOptional()
  text?: string;
}
