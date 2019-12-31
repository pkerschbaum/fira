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

export class ImportQueriesReqDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportQuery)
  readonly queries: ImportQuery[];
}

class ImportQuery {
  @IsNumber()
  @IsDefined()
  readonly id: number;
  @IsString()
  @IsNotEmpty()
  readonly text: string;
}

export class ImportQueriesRespDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportQueryResult)
  readonly importedQueries: ImportQueryResult[];
}

class ImportQueryResult {
  @IsNumber()
  @IsDefined()
  readonly id: number;
  @IsString()
  @IsNotEmpty()
  readonly status: ImportStatus;
  @IsString()
  readonly error?: string;
}
