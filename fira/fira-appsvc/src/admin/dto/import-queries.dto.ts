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

import {
  ImportStatus,
  ImportAsset,
  ImportResult,
  ImportQueriesReq,
  ImportQueriesResp,
} from '../../../../fira-commons';

export class ImportQueriesReqDto implements ImportQueriesReq {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportQuery)
  readonly queries: ImportQuery[];
}

class ImportQuery implements ImportAsset {
  @IsNumber()
  @IsDefined()
  readonly id: string;
  @IsString()
  @IsNotEmpty()
  readonly text: string;
}

export class ImportQueriesRespDto implements ImportQueriesResp {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportQueryResult)
  readonly importedQueries: ImportQueryResult[];
}

class ImportQueryResult implements ImportResult {
  @IsNumber()
  @IsDefined()
  readonly id: string;
  @IsString()
  @IsNotEmpty()
  @IsEnum(ImportStatus)
  readonly status: ImportStatus;
  @IsString()
  @IsOptional()
  readonly error?: string;
}
