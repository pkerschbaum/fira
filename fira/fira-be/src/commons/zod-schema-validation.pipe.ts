import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import * as z from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.Schema<unknown>) {}

  public transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (e) {
      if (!(e instanceof z.ZodError)) {
        throw e;
      }
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        errors: e.errors,
      });
    }
  }
}
