import { IsString, IsNotEmpty } from 'class-validator';

import { RefreshRequest } from '../auth.types';
import { AuthResponse } from '../../identity-management/identity-management.types';

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
