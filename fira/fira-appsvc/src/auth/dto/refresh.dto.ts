import { IsString, IsNotEmpty } from 'class-validator';

import { RefreshRequest, AuthResponse } from '../../../../fira-commons';

export class RefreshRequestDto implements RefreshRequest {
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}

export class RefreshResponseDto implements AuthResponse {
  @IsString()
  @IsNotEmpty()
  readonly accessToken: string;
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}
