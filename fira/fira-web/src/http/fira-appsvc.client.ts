import { AxiosRequestConfig } from 'axios';
import deepmerge from 'deepmerge';
import qs from 'qs';

import * as config from '../config';
import { httpClient, Request, RequestConfig } from './http.client';
import { browserStorage } from '../browser-storage/browser-storage';
import { store } from '../state/store';
import {
  HEADER_CLIENT_ID,
  HEADER_REQUEST_ID,
  uniqueIdGenerator,
  objects,
} from '../../../fira-commons';
import { Query, QueryParams } from '../../../fira-commons/src/rest-api';

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

export function buildQuery(query?: Query<any>): QueryParams {
  return {
    skip: query?.skip,
    take: query?.take,
    filter: buildFilter(query?.filter),
    orderBy: buildOrderBy(query?.orderBy),
  };
}

function buildFilter(filterObject?: Query<any>['filter']): string[] | undefined {
  let filter: string[] | undefined = undefined;

  if (filterObject !== undefined && !objects.isEmpty(filterObject)) {
    filter = [];
    for (const prop of Object.keys(filterObject)) {
      const operator = Object.keys(filterObject[prop] as any)[0];
      filter.push(`${prop}||${operator}||${(filterObject[prop] as any)[operator]}`);
    }
  }

  return filter;
}

function buildOrderBy(orderByObject?: Query<any>['orderBy']): string[] | undefined {
  let sort: string[] | undefined = undefined;

  if (orderByObject !== undefined && !objects.isEmpty(orderByObject)) {
    sort = [];
    for (const prop of Object.keys(orderByObject)) {
      sort.push(`${String(prop)}||${orderByObject[prop]}`);
    }
  }

  return sort;
}
