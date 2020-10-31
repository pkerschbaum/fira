import {
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsDefined,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ImportStatus,
  ImportJudgementPairsReq,
  ImportJudgementPair,
  ImportJudgementPairResult,
  ImportJudgementPairsResp,
} from '../../../../fira-commons';

export class ImportJudgementPairsReqDto implements ImportJudgementPairsReq {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportJudgementPairDto)
  readonly judgementPairs: ImportJudgementPairDto[];
}

class ImportJudgementPairDto implements ImportJudgementPair {
  @IsString()
  @IsDefined()
  readonly documentId: string;
  @IsString()
  @IsDefined()
  readonly queryId: string;
  @IsString()
  @IsDefined()
  readonly priority: string;
}

export class ImportJudgementPairsRespDto implements ImportJudgementPairsResp {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportJudgementPairResultDto)
  readonly importedJudgementPairs: ImportJudgementPairResultDto[];
}

class ImportJudgementPairResultDto implements ImportJudgementPairResult {
  @IsString()
  @IsDefined()
  readonly documentId: string;
  @IsString()
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
