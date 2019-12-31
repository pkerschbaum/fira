export class LoginRequestDto {
  readonly username: string;
  readonly password: string;
}

export class LoginResponseDto {
  readonly accessToken: string;
  readonly refreshToken: string;
}
