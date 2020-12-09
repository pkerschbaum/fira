import { appsvcHttpClient } from './fira-appsvc.client';
import {
  basePaths,
  AdminRequestor,
  AdminReqResp,
  ExceptionHandler,
  UpdateConfig,
} from '@fira-commons/src/rest-api';

const request: AdminRequestor = async (
  request: AdminReqResp['request'],
  additionalArgs?: {
    timeout?: number;
    exceptionHandlers?: ExceptionHandler[];
  },
) => {
  const url = basePaths.admin + '/' + request.url;

  return (
    await appsvcHttpClient.request({
      request: { ...request, url, timeout: additionalArgs?.timeout },
      exceptionHandlers: additionalArgs?.exceptionHandlers,
    })
  ).data as any;
};

export const adminClient = {
  updateConfig: async (updateConfigData: UpdateConfig['request']['data']) => {
    return await request({
      url: 'v1/config',
      data: updateConfigData,
      method: 'PUT',
    });
  },

  exportJudgements: async () => {
    return await request(
      {
        url: 'v1/judgements/export/tsv',
        method: 'GET',
      },
      { timeout: 60000 },
    );
  },

  exportFeedback: async () => {
    return await request({
      url: 'v1/feedback/export/tsv',
      method: 'GET',
    });
  },

  loadStatistics: async () => {
    return await request({
      url: 'v1/statistics',
      method: 'GET',
    });
  },
};
