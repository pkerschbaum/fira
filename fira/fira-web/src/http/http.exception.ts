import { HttpStatus } from './http-status.enum';
import { http } from '@fira-commons';

export class HttpException<StatusCode extends HttpStatus = never> extends Error {
  public readonly status: HttpStatus;
  public readonly errorText?: string;
  public readonly errorData: http.EXCEPTION_DATA[StatusCode];

  constructor(status: StatusCode, errorText?: string, errorData?: http.EXCEPTION_DATA[StatusCode]) {
    super();
    this.status = status;
    this.errorText = errorText;
    this.message = errorText ?? '';
    this.errorData = errorData;
  }

  toString() {
    if (this.errorText) {
      return `HttpException: status=${this.status}, errorText='${this.errorText}'`;
    } else {
      return `HttpException: status=${this.status}`;
    }
  }
}
