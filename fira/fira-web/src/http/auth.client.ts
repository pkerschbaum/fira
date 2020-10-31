import { appsvcHttpClient } from './fira-appsvc.client';
import { createLogger } from '../commons/logger';
import { HttpException } from './http.exception';
import { promises } from '../../../fira-commons';
import {
  basePaths,
  AuthRequestor,
  AuthReqRes,
  ExceptionHandler,
  Login,
  Refresh,
} from '../../../fira-commons/src/rest';

const REFRESH_RETRY_COUNT = 5;
const REFRESH_RETRY_DELAY = 3 * 1000; // 3 seconds

const logger = createLogger('auth.client');

const request: AuthRequestor = async (
  request: AuthReqRes['request'],
  additionalArgs?: {
    exceptionHandlers?: ExceptionHandler[];
  },
) => {
  const url = basePaths.auth + '/' + request.url;

  return (
    await appsvcHttpClient.request({
      request: { ...request, url },
      exceptionHandlers: additionalArgs?.exceptionHandlers,
    })
  ).data as any;
};

export const authClient = {
  login: async (loginData: Login['request']['data']) => {
    return await request(
      { url: 'v1/login', data: loginData, method: 'POST' },
      {
        exceptionHandlers: [
          {
            condition: (e) => e.response?.status === 401,
            exception: (_) => new HttpException(401, 'credentials invalid'),
          },
        ],
      },
    );
  },

  refresh: async (refreshData: Refresh['request']['data']) => {
    logger.info('executing refresh...', undefined, { refreshData });

    // retry refresh with same token 3 times because if the internet connection was idle,
    // ERR_NETWORK_IO_SUSPENDED can occur on the first try
    let attempt = 1;
    let lastError;
    while (attempt <= REFRESH_RETRY_COUNT) {
      try {
        return await request({
          url: 'v1/refresh',
          data: refreshData,
          method: 'POST',
        });
      } catch (e) {
        logger.info(`refresh failed for attempt=${attempt}`, { error: e });

        lastError = e;
        attempt++;

        if (e instanceof HttpException) {
          // got some response from backend --> no retry necessary
          break;
        }

        if (attempt <= REFRESH_RETRY_COUNT) {
          await promises.timeout(REFRESH_RETRY_DELAY);
        }
      }
    }

    logger.error('refresh failed!', { lastError });
    throw lastError;
  },
};
