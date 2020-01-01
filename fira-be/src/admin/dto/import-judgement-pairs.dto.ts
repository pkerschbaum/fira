import {
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ImportStatus } from '../../model/commons.model';

export class ImportJudgementPairsReqDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportJudgementPair)
  readonly judgementPairs: ImportJudgementPair[];
}

class ImportJudgementPair {
  @IsNumber()
  @IsDefined()
  readonly documentId: number;
  @IsNumber()
  @IsDefined()
  readonly queryId: number;
  @IsNumber()
  @IsDefined()
  readonly priority: number;
}

export class ImportJudgementPairsRespDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportJudgementPairResult)
  readonly importedJudgementPairs: ImportJudgementPairResult[];
}

class ImportJudgementPairResult {
  @IsNumber()
  @IsDefined()
  readonly documentId: number;
  @IsNumber()
  @IsDefined()
  readonly queryId: number;
  @IsString()
  @IsNotEmpty()
  readonly status: ImportStatus;
  @IsString()
  readonly error?: string;
}
