import { HttpStatus } from './http-status.enum';

export class HttpException extends Error {
  private errorText: string;
  private status: HttpStatus;
  /**
   * Instantiate a plain HTTP Exception.
   *
   * @example
   * `throw new HttpException()`
   *
   * @param errorText string describing the error condition.
   * @param status HTTP response status code
   */
  constructor(errorText: string, status: HttpStatus) {
    super();
    this.errorText = errorText;
    this.status = status;
    this.message = errorText;
  }
  getResponse() {
    return this.errorText;
  }
  getStatus() {
    return this.status;
  }
  toString() {
    return `HttpException: status=${this.status}, errorText='${this.errorText}'`;
  }
}
