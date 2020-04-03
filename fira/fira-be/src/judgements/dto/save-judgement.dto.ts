import { IsNumber, IsDefined, IsEnum, IsArray, ArrayUnique } from 'class-validator';

import { SaveJudgement } from '../judgements.types';
import { RelevanceLevel } from '../../typings/enums';

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
