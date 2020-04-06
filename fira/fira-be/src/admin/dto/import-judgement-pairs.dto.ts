import {
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDefined,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ImportStatus } from '../../typings/enums';
import {
  ImportJudgementPairsReq,
  ImportJudgementPair,
  ImportJudgementPairResult,
  ImportJudgementPairsResp,
} from '../admin.types';

export class ImportJudgementPairsReqDto implements ImportJudgementPairsReq {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportJudgementPairDto)
  readonly judgementPairs: ImportJudgementPairDto[];
}

class ImportJudgementPairDto implements ImportJudgementPair {
  @IsNumber()
  @IsDefined()
  readonly documentId: string;
  @IsNumber()
  @IsDefined()
  readonly queryId: string;
  @IsNumber()
  @IsDefined()
  readonly priority: number;
}

export class ImportJudgementPairsRespDto implements ImportJudgementPairsResp {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportJudgementPairResultDto)
  readonly importedJudgementPairs: ImportJudgementPairResultDto[];
}

class ImportJudgementPairResultDto implements ImportJudgementPairResult {
  @IsNumber()
  @IsDefined()
  readonly documentId: string;
  @IsNumber()
  @IsDefined()
  readonly queryId: string;
  @IsString()
  @IsNotEmpty()
  @IsEnum(ImportStatus)
  readonly status: ImportStatus;
  @IsString()
  @IsOptional()
  readonly error?: string;
}