import axios from 'axios';

import { HttpException } from './http.exception';

const axiosClient = axios.create({
  timeout: 5000,
});

interface LoginRequestDto {
  readonly username: string;
  readonly password: string;
}

interface RefreshRequestDto {
  readonly refreshToken: string;
}

export interface AuthResponseDto {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export const httpClient = {
  login: async (loginRequest: LoginRequestDto): Promise<AuthResponseDto> => {
    try {
      return (await axiosClient.post<AuthResponseDto>('auth/v1/login', loginRequest)).data;
    } catch (e) {
      if (e.response?.status === 401) {
        throw new HttpException('credentials invalid', 401);
      }
      throw e;
    }
  },

  refresh: async (refreshRequest: RefreshRequestDto): Promise<AuthResponseDto> => {
    return (await axiosClient.post<AuthResponseDto>('auth/v1/refresh', refreshRequest)).data;
  },
};
