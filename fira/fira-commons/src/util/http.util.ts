const REGEX_IS_HTTP_URL = /^https?:\/\//;

export function isHttpURL(input: string): boolean {
  return !!REGEX_IS_HTTP_URL.exec(input);
}
