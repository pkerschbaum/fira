import { IsNumber, IsDefined, IsEnum, IsArray, ArrayUnique } from 'class-validator';

import { RelevanceLevel, SaveJudgement } from '../judgements.types';

export class SaveJudgementRequestDto implements SaveJudgement {
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
