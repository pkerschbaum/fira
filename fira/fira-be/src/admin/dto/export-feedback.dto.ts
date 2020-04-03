import { ValidateNested, IsInt, IsDefined, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

import { ExportFeedback, ExportFeedbackResponse } from '../../feedback/feedback.types';
import { FeedbackScore } from '../../typings/enums';

export class ExportFeedbackResponseDto implements ExportFeedbackResponse {
  @ValidateNested({ each: true })
  @Type(() => ExportFeedbackDto)
  readonly feedback: ExportFeedbackDto[];
}

class ExportFeedbackDto implements ExportFeedback {
  @IsInt()
  @IsDefined()
  readonly id: number;
  @IsDefined()
  @IsEnum(FeedbackScore)
  readonly score: FeedbackScore;
  @IsString()
  readonly text?: string;
  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}
