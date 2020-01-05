import { IsDefined, IsInt } from 'class-validator';

import { UpdateConfig } from '../admin.types';

export class UpdateConfigReqDto implements UpdateConfig {
  @IsInt()
  @IsDefined()
  readonly annotationTargetPerUser: number;
  @IsInt()
  @IsDefined()
  readonly annotationTargetPerJudgPair: number;
}
