import { appsvcHttpClient } from './fira-appsvc.client';
import { basePaths, MgmtRequestor, MgmtReqRes, ExceptionHandler } from '@fira-commons/src/rest-api';

const request: MgmtRequestor = async (
  request: MgmtReqRes['request'],
  additionalArgs?: {
    exceptionHandlers?: ExceptionHandler[];
  },
) => {
  const url = basePaths.mgmt + '/' + request.url;

  return (
    await appsvcHttpClient.request({
      request: { ...request, url },
      exceptionHandlers: additionalArgs?.exceptionHandlers,
    })
  ).data as any;
};

export const mgmtClient = {
  loadHealth: async () => {
    return await request({ url: 'v1/health', method: 'GET' });
  },
};
