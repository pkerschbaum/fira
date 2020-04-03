/* eslint-disable no-console */
/* tslint:disable no-console */

export const createLogger = (context: string) => {
  const logWithContext = (logFn: (message?: any, ...optionalParams: any[]) => void) => (
    message?: any,
    ...optionalParams: any[]
  ) => logFn(`[${context}] ${message}`, ...optionalParams);

  return {
    debug: logWithContext(console.debug),
    info: logWithContext(console.info),
    error: logWithContext(console.error),
    dir: logWithContext(console.dir),
    group: console.group,
    groupEnd: console.groupEnd,
  };
};
