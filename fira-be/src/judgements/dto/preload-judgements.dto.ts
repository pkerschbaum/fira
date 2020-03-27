import {
  IsString,
  IsNotEmpty,
  ArrayMinSize,
  ValidateNested,
  IsNumber,
  IsDefined,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

import { PreloadJudgement, PreloadJudgementResponse } from '../judgements.types';
import { JudgementMode, UserAnnotationAction } from '../../typings/enums';

export class PreloadJudgementsResponseDto implements PreloadJudgementResponse {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PreloadJudgementDto)
  readonly judgements: PreloadJudgementDto[];
  @IsInt()
  @IsDefined()
  readonly alreadyFinished: number;
  @IsInt()
  @IsDefined()
  readonly remainingToFinish: number;
  @IsEnum(UserAnnotationAction)
  @IsDefined()
  readonly nextUserAction: UserAnnotationAction;
}

class PreloadJudgementDto implements PreloadJudgement {
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
