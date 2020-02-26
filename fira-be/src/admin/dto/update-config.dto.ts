import { IsDefined, IsInt } from 'class-validator';

import { UpdateConfig } from '../admin.types';
import { JudgementMode } from '../../judgements/judgements.types';

export class UpdateConfigReqDto implements UpdateConfig {
  @IsInt()
  @IsDefined()
  readonly annotationTargetPerUser: number;
  @IsInt()
  @IsDefined()
  readonly annotationTargetPerJudgPair: number;
  @IsDefined()
  readonly judgementMode: JudgementMode;
}
