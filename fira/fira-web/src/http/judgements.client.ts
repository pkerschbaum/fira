import { appsvcHttpClient } from './fira-appsvc.client';
import {
  basePaths,
  JudgementsRequestor,
  JudgementsReqRes,
  ExceptionHandler,
  SubmitJudgement,
} from '../../../fira-commons/src/rest-api';

const request: JudgementsRequestor = async (
  request: JudgementsReqRes['request'],
  additionalArgs?: {
    exceptionHandlers?: ExceptionHandler[];
  },
) => {
  let url = basePaths.judgements + '/' + request.url;
  if ('pathParams' in request && request.pathParams !== undefined) {
    for (const [paramKey, paramValue] of Object.entries(request.pathParams)) {
      url = url.replace(`:${paramKey}`, `${paramValue}`);
    }
  }

  return (
    await appsvcHttpClient.request({
      request: { ...request, url },
      exceptionHandlers: additionalArgs?.exceptionHandlers,
    })
  ).data as any;
};

export const judgementsClient = {
  preloadJudgements: async () => {
    return await request({
      url: 'v1/preload',
      method: 'POST',
    });
  },

  loadJugementsOfUser: async () => {
    return await request({
      url: 'v1',
      method: 'GET',
    });
  },

  loadJugementById: async (judgementId: number) => {
    return await request({
      url: 'v1/:judgementId',
      pathParams: { judgementId },
      method: 'GET',
    });
  },

  submitJudgement: async (
    judgementId: number,
    submitJudgementData: SubmitJudgement['request']['data'],
  ) => {
    return await request({
      url: 'v1/:judgementId',
      pathParams: { judgementId },
      data: submitJudgementData,
      method: 'PUT',
    });
  },
};
