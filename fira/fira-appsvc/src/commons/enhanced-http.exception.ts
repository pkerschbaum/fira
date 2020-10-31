import { HttpException } from '@nestjs/common';

export class EnhancedHttpException<T extends {}> extends HttpException {
  constructor(message: string, status: number, data: T) {
    super({ statusCode: status, message, errorData: data }, status);
  }
}
