import axios, { AxiosRequestConfig } from 'axios';
import deepmerge from 'deepmerge';

import * as config from '../config';
import { HttpException } from './http.exception';
import { createLogger } from '../logger/logger';
import { store } from '../store/store';
import { browserStorage } from '../browser-storage/browser-storage';
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
  baseURL: `${config.application.homepage}/api`,
  timeout: 10000,
});
const logger = createLogger('http.client');
const REFRESH_RETRY_COUNT = 5;
const REFRESH_RETRY_DELAY = 3 * 1000; // 3 seconds

async function request<T>(requestConfig: AxiosRequestConfig) {
  const accessToken = store.getState().user?.accessToken.val;
  const clientId = browserStorage.getClientId();
  const additionalConfig: AxiosRequestConfig = {
    headers: {
      authorization: accessToken !== undefined ? `Bearer ${accessToken}` : undefined,
      'fira-client-id': clientId,
    },
  };

  return axiosClient.request<T>(deepmerge(requestConfig, additionalConfig));
}

export const httpClient = {
  login: async (loginRequest: LoginRequest): Promise<AuthResponse> => {
    logger.info('executing login...', { username: loginRequest.username });

    try {
      return (
        await request<AuthResponse>({ url: 'auth/v1/login', data: loginRequest, method: 'POST' })
      ).data;
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
        return (
          await request<AuthResponse>({
            url: 'auth/v1/refresh',
            data: refreshRequest,
            method: 'POST',
          })
        ).data;
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

  importUsers: async (importUsersRequest: ImportUsersRequest): Promise<ImportUsersResponse> => {
    logger.info('executing import users...', { importUsersRequest });

    try {
      return (
        await request<ImportUsersResponse>({
          url: 'admin/v1/import/users',
          data: importUsersRequest,
          method: 'POST',
        })
      ).data;
    } catch (e) {
      logger.error('import users failed!', e);
      throw e;
    }
  },

  importDocuments: async (
    importDocumentsRequest: ImportDocumentsReq,
  ): Promise<ImportDocumentsResp> => {
    logger.info('executing import documents...', { importDocumentsRequest });

    try {
      return (
        await request<ImportDocumentsResp>({
          url: 'admin/v1/import/documents',
          data: importDocumentsRequest,
          method: 'PUT',
        })
      ).data;
    } catch (e) {
      logger.error('import documents failed!', e);
      throw e;
    }
  },

  importQueries: async (importQueriesRequest: ImportQueriesReq): Promise<ImportQueriesResp> => {
    logger.info('executing import queries...', { importQueriesRequest });

    try {
      return (
        await request<ImportQueriesResp>({
          url: 'admin/v1/import/queries',
          data: importQueriesRequest,
          method: 'PUT',
        })
      ).data;
    } catch (e) {
      logger.error('import queries failed!', e);
      throw e;
    }
  },

  importJudgementPairs: async (
    importJudgPairsRequest: ImportJudgementPairsReq,
  ): Promise<ImportJudgementPairsResp> => {
    logger.info('executing import judgement pairs...', { importJudgPairsRequest });

    try {
      return (
        await request<ImportJudgementPairsResp>({
          url: 'admin/v1/import/judgement-pairs',
          data: importJudgPairsRequest,
          method: 'PUT',
        })
      ).data;
    } catch (e) {
      logger.error('import judgement pairs failed!', e);
      throw e;
    }
  },

  preloadJudgements: async (): Promise<PreloadJudgementResponse> => {
    logger.info('executing preload judgements...');

    try {
      return (
        await request<PreloadJudgementResponse>({
          url: 'judgements/v1/preload',
          method: 'POST',
        })
      ).data;
    } catch (e) {
      logger.error('preload judgements failed!', e);
      throw e;
    }
  },

  submitJudgement: async (
    judgementId: number,
    submitJudgementRequest: SaveJudgement,
  ): Promise<void> => {
    logger.info('executing submit judgement...', { submitJudgementRequest });

    try {
      await request({
        url: `judgements/v1/${judgementId}`,
        data: submitJudgementRequest,
        method: 'PUT',
      });
    } catch (e) {
      logger.error('submit judgement failed!', e);
      throw e;
    }
  },

  submitFeedback: async (submitFeedbackRequest: SubmitFeedback): Promise<void> => {
    logger.info('executing submit feedback...', { submitFeedbackRequest });

    try {
      await request({
        url: `feedback/v1`,
        data: submitFeedbackRequest,
        method: 'POST',
      });
    } catch (e) {
      logger.error('submit feedback failed!', e);
      throw e;
    }
  },

  exportJudgements: async (): Promise<string> => {
    logger.info('executing export of judgements...');

    try {
      return (
        await request<string>({
          url: `admin/v1/judgements/export/tsv`,
          method: 'GET',
        })
      ).data;
    } catch (e) {
      logger.error('export of judgements failed!', e);
      throw e;
    }
  },

  exportFeedback: async (): Promise<string> => {
    logger.info('executing export of feedback...');

    try {
      return (
        await request<string>({
          url: `admin/v1/feedback/export/tsv`,
          method: 'GET',
        })
      ).data;
    } catch (e) {
      logger.error('export of feedback failed!', e);
      throw e;
    }
  },

  updateConfig: async (updateConfigRequest: UpdateConfig): Promise<void> => {
    logger.info('executing update of config...', { updateConfigRequest });

    try {
      await request({
        url: `admin/v1/config`,
        data: updateConfigRequest,
        method: 'PUT',
      });
    } catch (e) {
      logger.error('update of config failed!', e);
      throw e;
    }
  },

  getStatistics: async (): Promise<StatisticsResp> => {
    logger.info('executing retrieval of statistics...');

    try {
      return (
        await request<StatisticsResp>({
          url: `admin/v1/statistics`,
          method: 'GET',
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
