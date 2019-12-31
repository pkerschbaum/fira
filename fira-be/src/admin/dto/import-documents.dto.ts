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

export class ImportDocumentsReqDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportDocument)
  readonly documents: ImportDocument[];
}

class ImportDocument {
  @IsNumber()
  @IsDefined()
  readonly id: number;
  @IsString()
  @IsNotEmpty()
  readonly text: string;
}

export class ImportDocumentsRespDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportDocumentResult)
  readonly importedDocuments: ImportDocumentResult[];
}

class ImportDocumentResult {
  @IsNumber()
  @IsDefined()
  readonly id: number;
  @IsString()
  @IsNotEmpty()
  readonly status: ImportStatus;
  @IsString()
  readonly error?: string;
}
