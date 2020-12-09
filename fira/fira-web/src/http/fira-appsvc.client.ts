import { AxiosRequestConfig } from 'axios';
import deepmerge from 'deepmerge';
import qs from 'qs';

import * as config from '../config';
import { httpClient, Request, RequestConfig } from './http.client';
import { browserStorage } from '../browser-storage/browser-storage';
import { store } from '../state/store';
import { HEADER_CLIENT_ID, HEADER_REQUEST_ID, uniqueIdGenerator } from '@fira-commons';

const appsvcBaseUrl = `${config.application.homepage}/api`;
const appsvcTimeout = config.http.timeout;

export const appsvcHttpClient = {
  request: async function <T>({ request, exceptionHandlers: specificExceptionHandlers }: Request) {
    // add some default headers
    let accessToken = store.getState().user?.accessToken.val;
    const clientId = browserStorage.getClientId();
    const requestId = uniqueIdGenerator.generate();
    const additionalConfig: AxiosRequestConfig = {
      headers: {
        authorization: accessToken !== undefined ? `Bearer ${accessToken}` : undefined,
        [HEADER_CLIENT_ID]: clientId,
        [HEADER_REQUEST_ID]: requestId,
      },
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    };
    const requestConfig = deepmerge<RequestConfig>(request, additionalConfig);
    requestConfig.url = appsvcBaseUrl + '/' + requestConfig.url;
    requestConfig.timeout = requestConfig.timeout ?? appsvcTimeout;

    // execute request
    return await httpClient.request<T>({
      request: requestConfig,
      exceptionHandlers: specificExceptionHandlers,
    });
  },
};
