/* eslint-disable */
// based on: https://github.com/nestjs/nest/blob/master/packages/common/services/logger.service.ts
import * as clc from 'cli-color';
import * as moment from 'moment';

import { LogContext } from './base-logger';
import { ObjectLiteral } from '../../../../fira-commons';

const yellow = clc.xterm(3);
const orange = clc.xterm(209);

let lastTimestamp: number;
const isTimeDiffEnabled = false;

export const ColoredStringifyLogger = {
  log(message: string, messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, clc.green, messageContext, logContext, isTimeDiffEnabled);
  },

  debug(message: string, messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, clc.magentaBright, messageContext, logContext, isTimeDiffEnabled);
  },

  warn(message: string, messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, orange, messageContext, logContext, isTimeDiffEnabled);
  },

  error(message: string, error?: any, messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, clc.red, messageContext, logContext, isTimeDiffEnabled);
    printStackTrace(error);
  },

  verbose(message: string, messageContext?: ObjectLiteral, logContext?: LogContext) {
    printMessage(message, clc.cyanBright, messageContext, logContext, isTimeDiffEnabled);
  },
};

function printMessage(
  message: string,
  color: (message: string) => string,
  messageContext?: ObjectLiteral,
  logContext?: LogContext,
  isTimeDiffEnabled?: boolean,
) {
  const timestamp = moment().format('YYYY-MM-DD:hh:mm:ss.SSSZ');
  const contextMessage = logContext !== undefined ? buildContextMessage(logContext) : undefined;
  const timestampDiff = updateAndGetTimestampDiff(isTimeDiffEnabled);

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
    `${timestamp} ${yellow(contextMessage ?? '')}${color(message)}` +
      `${color(additionalMessage)}${timestampDiff}\n`,
  );
}

function buildContextMessage(context: LogContext): string {
  let result = '';
  if (context.component !== undefined) {
    result += `[${context.component}] `;
  }
  if (context.clientId !== undefined) {
    result += `[clientId=${context.clientId}] `;
  }
  if (context.inRequestId !== undefined) {
    result += `[inRequestId=${context.inRequestId}] `;
  }
  if (context.outRequestId !== undefined) {
    result += `[outRequestId=${context.outRequestId}] `;
  }
  return result;
}

function printStackTrace(trace: any) {
  if (!trace) {
    return;
  }
  if (trace instanceof Error) {
    process.stdout.write(`${trace.stack}\n`);
  } else {
    process.stdout.write(`${trace}\n`);
  }
}

function updateAndGetTimestampDiff(isTimeDiffEnabled?: boolean): string {
  const includeTimestamp = lastTimestamp && isTimeDiffEnabled;
  const result = !includeTimestamp ? '' : yellow(` +${Date.now() - lastTimestamp}ms`);
  lastTimestamp = Date.now();
  return result;
}
