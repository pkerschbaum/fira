import axios from 'axios';

import { HttpException } from './http.exception';
import { createLogger } from '../logger/logger';

import {
  LoginRequest,
  ImportUsersResponse,
  ImportUsersRequest,
  AuthResponse,
  RefreshRequest,
  ImportDocumentsReq,
  ImportDocumentsResp,
  ImportQueriesReq,
  ImportQueriesResp,
  ImportJudgementPairsReq,
  ImportJudgementPairsResp,
  PreloadJudgementResponse,
  SaveJudgement,
  StatisticsResp,
  UpdateConfig,
  SubmitFeedback,
} from '../typings/fira-be-typings';

const axiosClient = axios.create({
  baseURL: process.env.PUBLIC_URL,
  timeout: 5000,
});
const logger = createLogger('http.client');
const REFRESH_RETRY_COUNT = 5;
const REFRESH_RETRY_DELAY = 3 * 1000; // 3 seconds

export const httpClient = {
  login: async (loginRequest: LoginRequest): Promise<AuthResponse> => {
    logger.info('executing login...', { username: loginRequest.username });

    try {
      return (await axiosClient.post<AuthResponse>('auth/v1/login', loginRequest)).data;
    } catch (e) {
      logger.error('login failed!', e);
      if (e.response?.status === 401) {
        throw new HttpException('credentials invalid', 401);
      }
      throw e;
    }
  },

  refresh: async (refreshRequest: RefreshRequest): Promise<AuthResponse> => {
    logger.info('executing refresh...', { refreshRequest });

    // retry refresh with same token 3 times because if the internet connection was idle,
    // ERR_NETWORK_IO_SUSPENDED can occur on the first try
    let attempt = 1;
    let lastError;
    while (attempt <= REFRESH_RETRY_COUNT) {
      try {
        return (await axiosClient.post<AuthResponse>('auth/v1/refresh', refreshRequest)).data;
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

  importUsers: async (
    accessToken: string,
    importUsersRequest: ImportUsersRequest,
  ): Promise<ImportUsersResponse> => {
    logger.info('executing import users...', { importUsersRequest });

    try {
      return (
        await axiosClient.post<ImportUsersResponse>('admin/v1/import/users', importUsersRequest, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
    } catch (e) {
      logger.error('import users failed!', e);
      throw e;
    }
  },

  importDocuments: async (
    accessToken: string,
    importDocumentsRequest: ImportDocumentsReq,
  ): Promise<ImportDocumentsResp> => {
    logger.info('executing import documents...', { importDocumentsRequest });

    try {
      return (
        await axiosClient.put<ImportDocumentsResp>(
          'admin/v1/import/documents',
          importDocumentsRequest,
          {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
        )
      ).data;
    } catch (e) {
      logger.error('import documents failed!', e);
      throw e;
    }
  },

  importQueries: async (
    accessToken: string,
    importQueriesRequest: ImportQueriesReq,
  ): Promise<ImportQueriesResp> => {
    logger.info('executing import queries...', { importQueriesRequest });

    try {
      return (
        await axiosClient.put<ImportQueriesResp>('admin/v1/import/queries', importQueriesRequest, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
    } catch (e) {
      logger.error('import queries failed!', e);
      throw e;
    }
  },

  importJudgementPairs: async (
    accessToken: string,
    importJudgPairsRequest: ImportJudgementPairsReq,
  ): Promise<ImportJudgementPairsResp> => {
    logger.info('executing import judgement pairs...', { importJudgPairsRequest });

    try {
      return (
        await axiosClient.put<ImportJudgementPairsResp>(
          'admin/v1/import/judgement-pairs',
          importJudgPairsRequest,
          {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
        )
      ).data;
    } catch (e) {
      logger.error('import judgement pairs failed!', e);
      throw e;
    }
  },

  preloadJudgements: async (accessToken: string): Promise<PreloadJudgementResponse> => {
    logger.info('executing preload judgements...');

    try {
      return (
        await axiosClient.post<PreloadJudgementResponse>('judgements/v1/preload', null, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
    } catch (e) {
      logger.error('preload judgements failed!', e);
      throw e;
    }
  },

  submitJudgement: async (
    accessToken: string,
    judgementId: number,
    submitJudgementRequest: SaveJudgement,
  ): Promise<void> => {
    logger.info('executing submit judgement...', { submitJudgementRequest });

    try {
      return (
        await axiosClient.put(`judgements/v1/${judgementId}`, submitJudgementRequest, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
    } catch (e) {
      logger.error('submit judgement failed!', e);
      throw e;
    }
  },

  submitFeedback: async (
    accessToken: string,
    submitFeedbackRequest: SubmitFeedback,
  ): Promise<void> => {
    logger.info('executing submit feedback...', { submitFeedbackRequest });

    try {
      return (
        await axiosClient.post(`feedback/v1`, submitFeedbackRequest, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
    } catch (e) {
      logger.error('submit feedback failed!', e);
      throw e;
    }
  },

  exportJudgements: async (accessToken: string): Promise<string> => {
    logger.info('executing export of judgements...');

    try {
      return (
        await axiosClient.get(`admin/v1/judgements/export/tsv`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
    } catch (e) {
      logger.error('export of judgements failed!', e);
      throw e;
    }
  },

  exportFeedback: async (accessToken: string): Promise<string> => {
    logger.info('executing export of feedback...');

    try {
      return (
        await axiosClient.get(`admin/v1/feedback/export/tsv`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
    } catch (e) {
      logger.error('export of feedback failed!', e);
      throw e;
    }
  },

  updateConfig: async (accessToken: string, updateConfigRequest: UpdateConfig): Promise<void> => {
    logger.info('executing update of config...', { updateConfigRequest });

    try {
      return (
        await axiosClient.put(`admin/v1/config`, updateConfigRequest, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
    } catch (e) {
      logger.error('update of config failed!', e);
      throw e;
    }
  },

  getStatistics: async (accessToken: string): Promise<StatisticsResp> => {
    logger.info('executing retrieval of statistics...');

    try {
      return (
        await axiosClient.get(`admin/v1/statistics`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      ).data;
    } catch (e) {
      logger.error('retrieval of statistics failed!', e);
      throw e;
    }
  },
};

function timeout(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
