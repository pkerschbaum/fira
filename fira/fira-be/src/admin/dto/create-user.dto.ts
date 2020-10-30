import {
  IsString,
  IsNotEmpty,
  ArrayMinSize,
  ValidateNested,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  ImportStatus,
  ImportUserResponse,
  ImportUsersResponse,
  ImportUserRequest,
  ImportUsersRequest,
} from '../../../../fira-commons';

export class ImportUsersRequestDto implements ImportUsersRequest {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportUserRequestDto)
  readonly users: ImportUserRequestDto[];
}

class ImportUserRequestDto implements ImportUserRequest {
  @IsString()
  @IsNotEmpty()
  readonly id: string;
}

export class ImportUsersResponseDto implements ImportUsersResponse {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportUserResponseDto)
  readonly importedUsers: ImportUserResponseDto[];
}

class ImportUserResponseDto implements ImportUserResponse {
  @IsString()
  @IsNotEmpty()
  readonly id: string;
  @IsNotEmpty()
  @IsEnum(ImportStatus)
  readonly status: ImportStatus;
  @IsString()
  @IsOptional()
  readonly username?: string;
  @IsString()
  @IsOptional()
  readonly password?: string;
  @IsString()
  @IsOptional()
  readonly error?: string;
}
