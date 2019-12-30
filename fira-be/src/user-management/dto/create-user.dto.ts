import { ApiProperty } from '@nestjs/swagger';

class UserRequest {
  @ApiProperty()
  id!: string;
}

export class ImportUsersRequestDto {
  @ApiProperty({ type: UserRequest, isArray: true })
  users!: UserRequest[];
}

class UserResponse {
  @ApiProperty()
  id!: string;
  @ApiProperty({ required: false })
  username?: string;
  @ApiProperty({ required: false })
  password?: string;
  @ApiProperty({ required: false })
  error?: string;
}

export class ImportUsersResponseDto {
  @ApiProperty({ type: UserResponse, isArray: true })
  importedUsers!: UserResponse[];
}
