import { IsNotEmpty, IsString } from 'class-validator';

import { LoginRequest, AuthResponse } from '../../../../fira-commons';

export class LoginRequestDto implements LoginRequest {
  @IsString()
  @IsNotEmpty()
  readonly username: string;
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class LoginResponseDto implements AuthResponse {
  @IsString()
  @IsNotEmpty()
  readonly accessToken: string;
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}
