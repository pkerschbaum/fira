import { IsDefined, IsString, IsOptional, IsEnum } from 'class-validator';

import { SaveFeedback, FeedbackScore } from '../feedback.types';

export class SaveFeedbackDto implements SaveFeedback {
  @IsDefined()
  @IsEnum(FeedbackScore)
  status: FeedbackScore;
  @IsString()
  @IsOptional()
  text?: string;
}
