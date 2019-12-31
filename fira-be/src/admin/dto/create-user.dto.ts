import {
  IsString,
  IsNotEmpty,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { ImportStatus } from '../../model/commons.model';

class ImportUserRequest {
  @IsString()
  @IsNotEmpty()
  readonly id: string;
}

export class ImportUsersRequestDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportUserRequest)
  readonly users: ImportUserRequest[];
}

class ImportUserResponse {
  @IsString()
  @IsNotEmpty()
  readonly id: string;
  @IsNotEmpty()
  readonly status: ImportStatus;
  @IsString()
  readonly username?: string;
  @IsString()
  readonly password?: string;
  @IsString()
  readonly error?: string;
}

export class ImportUsersResponseDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportUserResponse)
  readonly importedUsers: ImportUserResponse[];
}
