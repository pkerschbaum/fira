import { ValidateNested, IsInt, IsDefined, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import {
  ExportJudgement,
  ExportJudgementsResponse,
  RelevanceLevel,
  JudgementMode,
} from 'src/judgements/judgements.types';

export class ExportJudgementsResponseDto implements ExportJudgementsResponse {
  @ValidateNested({ each: true })
  @Type(() => ExportJudgementResponseDto)
  readonly judgements: ExportJudgementResponseDto[];
}

class ExportJudgementResponseDto implements ExportJudgement {
  @IsInt()
  @IsDefined()
  readonly id: number;
  @IsDefined()
  readonly relevanceLevel: RelevanceLevel;
  @ValidateNested({ each: true })
  readonly relevanceCharacterRanges: Array<{ startChar: number; endChar: number }>;
  @IsDefined()
  readonly rotate: boolean;
  @IsDefined()
  readonly mode: JudgementMode;
  @IsInt()
  @IsDefined()
  readonly durationUsedToJudgeMs: number;
  @IsInt()
  @IsDefined()
  readonly judgedAtUnixTS: number;
  @IsInt()
  @IsDefined()
  readonly documentId: number;
  @IsInt()
  @IsDefined()
  readonly queryId: number;
  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}
