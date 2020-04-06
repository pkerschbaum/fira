export type LoginRequest = {
  readonly username: string;
  readonly password: string;
};

export type RefreshRequest = {
  readonly refreshToken: string;
};
