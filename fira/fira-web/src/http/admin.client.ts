import { appsvcHttpClient } from './fira-appsvc.client';
import {
  basePaths,
  AdminRequestor,
  AdminReqResp,
  ExceptionHandler,
  ImportUsers,
  ImportDocuments,
  ImportQueries,
  ImportJudgementPairs,
  UpdateConfig,
} from '../../../fira-commons/src/rest';

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
  importUsers: async (importUsersData: ImportUsers['request']['data']) => {
    return await request({ url: 'v1/import/users', data: importUsersData, method: 'POST' });
  },

  importDocuments: async (importDocumentsData: ImportDocuments['request']['data']) => {
    return await request({ url: 'v1/import/documents', data: importDocumentsData, method: 'PUT' });
  },

  importQueries: async (importQueriesData: ImportQueries['request']['data']) => {
    return await request({ url: 'v1/import/queries', data: importQueriesData, method: 'PUT' });
  },

  importJudgementPairs: async (importPairsData: ImportJudgementPairs['request']['data']) => {
    return await request({
      url: 'v1/import/judgement-pairs',
      data: importPairsData,
      method: 'PUT',
    });
  },

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
