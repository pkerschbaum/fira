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
import { ImportAsset, ImportResult, ImportDocumentsReq, ImportDocumentsResp } from '../admin.types';

export class ImportDocumentsReqDto implements ImportDocumentsReq {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportDocument)
  readonly documents: ImportDocument[];
}

class ImportDocument implements ImportAsset {
  @IsNumber()
  @IsDefined()
  readonly id: string;
  @IsString()
  @IsNotEmpty()
  readonly text: string;
}

export class ImportDocumentsRespDto implements ImportDocumentsResp {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportDocumentResult)
  readonly importedDocuments: ImportDocumentResult[];
}

class ImportDocumentResult implements ImportResult {
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
