import * as moment from 'moment';

import * as config from '../../config';
import { LogContext } from './base-logger';
import { ObjectLiteral } from '@fira-commons';

export const JsonLogger = {
  log(message: string, messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, 'info', messageContext, logContext);
  },

  debug(message: string, messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, 'debug', messageContext, logContext);
  },

  warn(message: string, messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, 'warning', messageContext, logContext);
  },

  error(message: string, trace = '', messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, 'error', messageContext, { trace, ...logContext });
  },

  verbose(message: string, messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, 'debug', messageContext, logContext);
  },
};

function printMessage(
  message: string,
  severity: 'info' | 'debug' | 'warning' | 'error',
  messageContext?: ObjectLiteral,
  logContext?: LogContext,
) {
  let additionalMessage = '';
  if (messageContext !== undefined) {
    for (const [prop, value] of Object.entries(messageContext)) {
      if (value !== undefined) {
        additionalMessage += ` [${prop}=${
          typeof value === 'string' ? value : JSON.stringify(value)
        }]`;
      }
    }
  }

  process.stdout.write(
    JSON.stringify({
      message: message + additionalMessage,
      severity,
      time: moment().toISOString(),
      ...messageContext,
      ...logContext,
    }) + '\n',
  );
}
