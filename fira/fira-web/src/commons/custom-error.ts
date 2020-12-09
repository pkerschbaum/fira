import { ObjectLiteral } from '@fira-commons';

// https://stackoverflow.com/a/48342359/1700319
export class CustomError extends Error {
  public readonly data: ObjectLiteral;

  constructor(message: string, data: ObjectLiteral) {
    // 'Error' breaks prototype chain here
    super(message);
    this.data = data;

    // restore prototype chain
    const actualProto = new.target.prototype;

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      (this as any).__proto__ = actualProto;
    }
  }
}
