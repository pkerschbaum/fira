// based on: https://github.com/nestjs/nest/blob/master/packages/common/services/logger.service.ts
import { Injectable, LogLevel, LoggerService, Optional } from '@nestjs/common';
import { isObject } from 'util';
import * as clc from 'cli-color';
import moment = require('moment');

const yellow = clc.xterm(3);

@Injectable()
export class BaseLogger implements LoggerService {
  private static logLevels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];
  private static lastTimestamp: number;
  private static instance: typeof BaseLogger | LoggerService = BaseLogger;
  private readonly isTimestampEnabled = true;

  constructor(@Optional() protected context?: string) {}

  error(message: any, trace = '', context?: string) {
    const instance = this.getInstance();
    if (!this.isLogLevelEnabled('error')) {
      return;
    }
    // tslint:disable-next-line: no-unused-expression
    instance && instance.error.call(instance, message, trace, context || this.context);
  }

  log(message: any, context?: string) {
    this.callFunction('log', message, context);
  }

  warn(message: any, context?: string) {
    this.callFunction('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.callFunction('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.callFunction('verbose', message, context);
  }

  setContext(context: string) {
    this.context = context;
  }

  static log(message: any, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.green, context, isTimeDiffEnabled);
  }

  static error(message: any, trace = '', context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.red, context, isTimeDiffEnabled);
    this.printStackTrace(trace);
  }

  static warn(message: any, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.yellow, context, isTimeDiffEnabled);
  }

  static debug(message: any, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.magentaBright, context, isTimeDiffEnabled);
  }

  static verbose(message: any, context = '', isTimeDiffEnabled = true) {
    this.printMessage(message, clc.cyanBright, context, isTimeDiffEnabled);
  }

  private callFunction(name: 'log' | 'warn' | 'debug' | 'verbose', message: any, context?: string) {
    if (!this.isLogLevelEnabled(name)) {
      return;
    }
    const instance = this.getInstance();
    const func = instance && (instance as typeof BaseLogger)[name];
    // tslint:disable-next-line: no-unused-expression
    func && func.call(instance, message, context || this.context, this.isTimestampEnabled);
  }

  private getInstance(): typeof BaseLogger | LoggerService {
    const { instance } = BaseLogger;
    return instance === this ? BaseLogger : instance;
  }

  private isLogLevelEnabled(level: LogLevel): boolean {
    return BaseLogger.logLevels.includes(level);
  }

  private static printMessage(
    message: any,
    color: (message: string) => string,
    context = '',
    isTimeDiffEnabled?: boolean,
  ) {
    const output = isObject(message)
      ? `${color('Object:')}\n${JSON.stringify(message, null, 2)}\n`
      : color(message);

    const timestamp = moment().format('YYYY-MM-DD:hh:mm:ss.SSSZ');

    const contextMessage = context ? yellow(`[${context}] `) : '';
    const timestampDiff = this.updateAndGetTimestampDiff(isTimeDiffEnabled);

    process.stdout.write(`${timestamp} ${contextMessage}${output}${timestampDiff}\n`);
  }

  private static updateAndGetTimestampDiff(isTimeDiffEnabled?: boolean): string {
    const includeTimestamp = BaseLogger.lastTimestamp && isTimeDiffEnabled;
    const result = includeTimestamp ? yellow(` +${Date.now() - BaseLogger.lastTimestamp}ms`) : '';
    BaseLogger.lastTimestamp = Date.now();
    return result;
  }

  private static printStackTrace(trace: string) {
    if (!trace) {
      return;
    }
    process.stdout.write(`${trace}\n`);
  }
}
