/* eslint-disable no-console */
/* tslint:disable no-console */

import { CustomError } from './custom-error';
import { ObjectLiteral, objects } from '@fira-commons';

export const createLogger = (context: string) => {
  const logWithContext = (
    logFn: (data: {
      message: string;
      logPayload?: ObjectLiteral;
      verboseLogPayload?: ObjectLiteral;
    }) => void,
  ) => (message: string, logPayload?: ObjectLiteral, verboseLogPayload?: ObjectLiteral) => {
    // if CustomErrors get passed in a payload, extract the data prop of the error and
    // append it to the payload
    let customLogPayload = objects.shallowCopy(logPayload);
    if (customLogPayload !== undefined) {
      for (const [prop, value] of Object.entries(customLogPayload)) {
        if (value instanceof CustomError) {
          customLogPayload[`${prop}_errorData`] = value.data;
        }
      }
    }
    let customVerboseLogPayload = objects.shallowCopy(verboseLogPayload);
    if (customVerboseLogPayload !== undefined) {
      for (const [prop, value] of Object.entries(customVerboseLogPayload)) {
        if (value instanceof CustomError) {
          customVerboseLogPayload[`${prop}_errorData`] = value.data;
        }
      }
    }

    return logFn({
      message: `[${context}] ${message}`,
      logPayload: customLogPayload,
      verboseLogPayload: customVerboseLogPayload,
    });
  };

  return {
    debug: logWithContext(({ message, logPayload, verboseLogPayload }) => {
      const additionalParams: any[] = [];
      if (logPayload !== undefined) additionalParams.push(logPayload);
      if (verboseLogPayload !== undefined) additionalParams.push(verboseLogPayload);
      console.debug(message, ...additionalParams);
    }),
    info: logWithContext(({ message, logPayload, verboseLogPayload }) => {
      const additionalParams: any[] = [];
      if (logPayload !== undefined) additionalParams.push(logPayload);
      if (verboseLogPayload !== undefined) additionalParams.push(verboseLogPayload);
      console.info(message, ...additionalParams);
    }),
    warn: logWithContext(({ message, logPayload, verboseLogPayload }) => {
      const additionalParams: any[] = [];
      if (logPayload !== undefined) additionalParams.push(logPayload);
      if (verboseLogPayload !== undefined) additionalParams.push(verboseLogPayload);
      console.warn(message, ...additionalParams);
    }),
    error: logWithContext(({ message, logPayload, verboseLogPayload }) => {
      const additionalParams: any[] = [];
      if (logPayload !== undefined) additionalParams.push(logPayload);
      if (verboseLogPayload !== undefined) additionalParams.push(verboseLogPayload);
      console.error(message, ...additionalParams);
    }),
    group: console.group,
    groupEnd: console.groupEnd,
  };
};
