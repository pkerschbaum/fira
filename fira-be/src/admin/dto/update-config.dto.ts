import { IsInt, IsEnum, IsBoolean, IsOptional } from 'class-validator';

import { UpdateConfig } from '../admin.types';
import { JudgementMode } from '../../judgements/judgements.types';

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
}
