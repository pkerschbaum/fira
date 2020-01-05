import { IsString, IsNotEmpty, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { ImportStatus } from '../../typings/commons';
import {
  ImportUserResponse,
  ImportUsersResponse,
  ImportUserRequest,
  ImportUsersRequest,
} from '../../identity-management/identity-management.types';

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
  readonly status: ImportStatus;
  @IsString()
  readonly username?: string;
  @IsString()
  readonly password?: string;
  @IsString()
  readonly error?: string;
}
