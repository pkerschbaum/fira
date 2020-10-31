import axios, { AxiosRequestConfig } from 'axios';

import { HttpException } from './http.exception';
import { ObjectLiteral } from '../../../fira-commons';
import { ExceptionHandler } from '../../../fira-commons/src/rest';

/* method mandatory */
export type Request = {
  request: RequestConfig;
  exceptionHandlers?: ExceptionHandler[];
};
export type RequestConfig = AxiosRequestConfig & {
  method: Pick<AxiosRequestConfig, 'method'>;
  formData?: ObjectLiteral;
};

const defaultExceptionHandlers: ExceptionHandler[] = [
  {
    condition: (e) => e.response?.status !== undefined && e.response.data?.errorData !== undefined,
    exception: (e) =>
      new HttpException(e.response.status, e.response.message, e.response.data.errorData),
  },
  {
    condition: (e) => e.response?.status !== undefined,
    exception: (e) => new HttpException(e.response.status, e.response.message),
  },
];

export const httpClient = {
  request: async function <T>({ request, exceptionHandlers: specificExceptionHandlers }: Request) {
    // compose specific exception handlers and default exception handlers
    let exceptionHandlers: ExceptionHandler[] = [];
    if (specificExceptionHandlers) {
      exceptionHandlers = [...specificExceptionHandlers];
    }
    exceptionHandlers.push(...defaultExceptionHandlers);

    // execute request
    try {
      return await axios.request<T>(request);
    } catch (e) {
      // apply exception handler, if matching handler found
      if (exceptionHandlers) {
        const handler = exceptionHandlers.find((handler) => handler.condition(e));
        if (handler) {
          throw handler.exception(e);
        }
      }
      throw e;
    }
  },
};
