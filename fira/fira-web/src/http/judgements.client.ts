import { appsvcHttpClient } from './fira-appsvc.client';
import {
  basePaths,
  JudgementsRequestor,
  JudgementsReqRes,
  ExceptionHandler,
  SubmitJudgement,
} from '../../../fira-commons/src/rest';

const request: JudgementsRequestor = async (
  request: JudgementsReqRes['request'],
  additionalArgs?: {
    exceptionHandlers?: ExceptionHandler[];
  },
) => {
  const url = basePaths.judgements + '/' + request.url;

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
