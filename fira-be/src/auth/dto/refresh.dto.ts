import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}

export class RefreshResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
