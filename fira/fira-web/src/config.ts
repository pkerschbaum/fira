// URL_REGEX taken from https://stackoverflow.com/a/26766402/1700319
const URL_REGEX = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

export const application = {
  environment: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  homepage: process.env.PUBLIC_URL ?? '',
  helpDialog: {
    shortcut: { key: 'KeyH', additionalKeys: ['ALT'] },
  },
} as const;

export const http = {
  timeout: 10000, // 10 sec
};

/**
 * E.g. if homepage is "http://localhost:8080/path1/path2" then:
 * - hostBase is "localhost:8080"
 * - pathName is "/path1/path2"
 */
export const homepageParts = {
  hostBase: URL_REGEX.exec(application.homepage)?.[4] ?? 'localhost',
  pathName: URL_REGEX.exec(application.homepage)?.[5] ?? '',
};
