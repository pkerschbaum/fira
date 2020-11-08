import { NotFoundException } from '@nestjs/common';

function throw404IfNullish<T>(obj: T): Exclude<T, undefined | null> {
  if (obj === undefined || obj === null) {
    throw new NotFoundException(`obj is nullish`);
  }
  return obj as Exclude<T, undefined | null>;
}

function throwIfNullish<T>(obj: T): Exclude<T, undefined | null> {
  if (obj === undefined || obj === null) {
    throw new Error(`obj is nullish`);
  }
  return obj as Exclude<T, undefined | null>;
}

export const httpUtils = { throw404IfNullish, throwIfNullish };
