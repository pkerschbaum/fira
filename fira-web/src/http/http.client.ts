import axios from 'axios';

import { HttpException } from './http.exception';
import { createLogger } from '../logger/logger';

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

const axiosClient = axios.create({
  timeout: 5000,
});
const logger = createLogger('http.client');
const REFRESH_RETRY_COUNT = 5;
const REFRESH_RETRY_DELAY = 3 * 1000; // 3 seconds

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

    // retry refresh with same token 3 times because if the internet connection was idle,
    // ERR_NETWORK_IO_SUSPENDED can occur on the first try
    let attempt = 1;
    let lastError;
    while (attempt <= REFRESH_RETRY_COUNT) {
      try {
        return (await axiosClient.post<AuthResponseDto>('auth/v1/refresh', refreshRequest)).data;
      } catch (e) {
        logger.info(`refresh failed for attempt=${attempt}`, { error: e });
        lastError = e;
        attempt++;
        if (e.response?.status) {
          // got some response from backend --> no retry necessary
          break;
        }
        if (attempt <= REFRESH_RETRY_COUNT) {
          await timeout(REFRESH_RETRY_DELAY);
        }
      }
    }
    logger.error('refresh failed!', lastError);
    throw lastError;
  },
};

function timeout(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}
