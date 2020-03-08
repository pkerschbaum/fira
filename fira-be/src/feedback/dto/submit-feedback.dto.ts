import { IsDefined, IsString, IsOptional, IsEnum } from 'class-validator';

import { SubmitFeedback } from '../feedback.types';
import { FeedbackScore } from '../../typings/enums';

export class SubmitFeedbackDto implements SubmitFeedback {
  @IsDefined()
  @IsEnum(FeedbackScore)
  score: FeedbackScore;
  @IsString()
  @IsOptional()
  text?: string;
}
