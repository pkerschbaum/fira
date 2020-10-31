import { appsvcHttpClient } from './fira-appsvc.client';
import {
  basePaths,
  FeedbackRequestor,
  FeedbackReqRes,
  ExceptionHandler,
  SubmitFeedback,
} from '../../../fira-commons/src/rest-api';

const request: FeedbackRequestor = async (
  request: FeedbackReqRes['request'],
  additionalArgs?: {
    exceptionHandlers?: ExceptionHandler[];
  },
) => {
  const url = basePaths.feedback + '/' + request.url;

  return (
    await appsvcHttpClient.request({
      request: { ...request, url },
      exceptionHandlers: additionalArgs?.exceptionHandlers,
    })
  ).data as any;
};

export const feedbackClient = {
  submitFeedback: async (submitFeedbackData: SubmitFeedback['request']['data']) => {
    return await request({ url: 'v1', data: submitFeedbackData, method: 'POST' });
  },
};
