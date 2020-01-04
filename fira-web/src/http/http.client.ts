import axios from 'axios';

import { HttpException } from './http.exception';
import { createLogger } from '../logger/logger';

const axiosClient = axios.create({
  timeout: 5000,
});
const logger = createLogger('http.client');

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
    logger.info('executing login...', { username: loginRequest.username });

    try {
      return (await axiosClient.post<AuthResponseDto>('auth/v1/login', loginRequest)).data;
    } catch (e) {
      logger.error('login failed!', e);
      if (e.response?.status === 401) {
        throw new HttpException('credentials invalid', 401);
      }
      throw e;
    }
  },

  refresh: async (refreshRequest: RefreshRequestDto): Promise<AuthResponseDto> => {
    logger.info('executing refresh...', { refreshRequest });

    try {
      return (await axiosClient.post<AuthResponseDto>('auth/v1/refresh', refreshRequest)).data;
    } catch (e) {
      logger.error('refresh failed!', e);
      throw e;
    }
  },
};
