import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class LoginResponseDto {
  @IsString()
  @IsNotEmpty()
  readonly accessToken: string;
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}
