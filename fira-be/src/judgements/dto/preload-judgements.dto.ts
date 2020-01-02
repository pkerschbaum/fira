import {
  IsString,
  IsNotEmpty,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
  IsDefined,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

import { JudgementMode } from '../entity/judgement.entity';

export class PreloadJudgementsResponseDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PreloadJudgementResponse)
  readonly judgements: PreloadJudgementResponse[];
}

class PreloadJudgementResponse {
  @IsNumber()
  @IsDefined()
  readonly id: number;
  @IsNotEmpty()
  @ArrayMinSize(1)
  readonly docAnnotationParts: string[];
  @IsNotEmpty()
  @IsString()
  readonly queryText: string;
  @IsDefined()
  @IsEnum(JudgementMode)
  readonly mode: JudgementMode;
}
