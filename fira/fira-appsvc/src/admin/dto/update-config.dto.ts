import { IsInt, IsEnum, IsBoolean, IsOptional } from 'class-validator';

import { JudgementMode, UpdateConfig } from '../../../../fira-commons';

export class UpdateConfigReqDto implements UpdateConfig {
  @IsOptional()
  @IsInt()
  readonly annotationTargetPerUser?: number;
  @IsOptional()
  @IsInt()
  readonly annotationTargetPerJudgPair?: number;
  @IsOptional()
  @IsEnum(JudgementMode)
  readonly judgementMode?: JudgementMode;
  @IsOptional()
  @IsBoolean()
  readonly rotateDocumentText?: boolean;
  @IsOptional()
  @IsInt()
  readonly annotationTargetToRequireFeedback?: number;
}
