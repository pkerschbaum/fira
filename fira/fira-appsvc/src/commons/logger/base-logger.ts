import * as config from '../../config';
import { ColoredStringifyLogger } from './colored-stringify-logger';
import { JsonLogger } from './json-logger';
import { assertUnreachable } from '../../../../fira-commons';

export const baseLogger =
  config.application.environment === 'development'
    ? ColoredStringifyLogger
    : config.application.environment === 'production'
    ? JsonLogger
    : assertUnreachable(config.application.environment);

export type LogContext = {
  component?: string;
  clientId?: string;
  inRequestId?: string;
  outRequestId?: string;
  trace?: string;
} & { [prop: string]: any };
