import { IsString } from 'class-validator';

class UserRequest {
  readonly id: string;
}

export class ImportUsersRequestDto {
  readonly users: UserRequest[];
}

class UserResponse {
  readonly id: string;
  @IsString()
  readonly username?: string;
  @IsString()
  readonly password?: string;
  @IsString()
  readonly error?: string;
}

export class ImportUsersResponseDto {
  readonly importedUsers: UserResponse[];
}
