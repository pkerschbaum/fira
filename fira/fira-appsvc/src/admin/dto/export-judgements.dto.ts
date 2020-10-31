import { ValidateNested, IsInt, IsDefined, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

import {
  JudgementMode,
  RelevanceLevel,
  ExportJudgement,
  ExportJudgementsResponse,
} from '../../../../fira-commons';

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
  @IsEnum(RelevanceLevel)
  readonly relevanceLevel: RelevanceLevel;
  @ValidateNested({ each: true })
  readonly relevanceCharacterRanges: Array<{ startChar: number; endChar: number }>;
  @IsDefined()
  readonly rotate: boolean;
  @IsDefined()
  @IsEnum(JudgementMode)
  readonly mode: JudgementMode;
  @IsInt()
  @IsDefined()
  readonly durationUsedToJudgeMs: number;
  @IsInt()
  @IsDefined()
  readonly judgedAtUnixTS: number;
  @IsInt()
  @IsDefined()
  readonly documentId: string;
  @IsInt()
  @IsDefined()
  readonly queryId: string;
  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}
