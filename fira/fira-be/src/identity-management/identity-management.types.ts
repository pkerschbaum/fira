import { ImportStatus } from '../typings/enums';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export type ImportUsersRequest = {
  readonly users: ImportUserRequest[];
};

export type ImportUserRequest = {
  readonly id: string;
};

export type ImportUsersResponse = {
  readonly importedUsers: ImportUserResponse[];
};

export type ImportUserResponse = {
  id: string;
  status: ImportStatus;
  username?: string;
  password?: string;
  error?: string;
};
