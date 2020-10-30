import bowser from 'bowser';

import { createLogger } from '../commons/logger';

const logger = createLogger('log-user-agent-info');

export async function logUserAgentInfo() {
  const userAgendInfo = getUserAgentInfo();
  logger.info(`user agent info`, { userAgendInfo });
}

export function getUserAgentInfo() {
  const browserParser = bowser.getParser(window.navigator.userAgent);

  return {
    browser: browserParser.getBrowser(),
    platform: browserParser.getPlatform(),
    os: browserParser.getOS(),
  };
}
