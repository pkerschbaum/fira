import {
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ImportStatus } from '../../typings/commons';
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
  readonly documentId: number;
  @IsNumber()
  @IsDefined()
  readonly queryId: number;
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
