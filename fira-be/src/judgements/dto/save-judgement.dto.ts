import {
  IsNumber,
  IsDefined,
  IsEnum,
  IsArray,
  ArrayUnique,
} from 'class-validator';

import { RelevanceLevel } from '../entity/judgement.entity';

export class SaveJudgementRequestDto {
  @IsEnum(RelevanceLevel)
  @IsDefined()
  readonly relevanceLevel: RelevanceLevel;
  @IsArray()
  @IsNumber(undefined, { each: true })
  @ArrayUnique()
  readonly relevancePositions: number[];
  @IsNumber()
  @IsDefined()
  readonly durationUsedToJudgeMs: number;
}
