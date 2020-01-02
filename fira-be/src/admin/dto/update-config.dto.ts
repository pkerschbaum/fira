import { IsDefined, IsInt } from 'class-validator';

export class UpdateConfigReqDto {
  @IsInt()
  @IsDefined()
  readonly annotationTargetPerUser: number;
  @IsInt()
  @IsDefined()
  readonly annotationTargetPerJudgPair: number;
}
