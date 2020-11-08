import { JsonCompatible, ObjectLiteral } from './types.util';

export function isEmpty(obj: ObjectLiteral) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

export function isNotNullish<T>(obj: T | undefined | null): obj is Exclude<T, undefined | null> {
  return obj !== undefined && obj !== null;
}

export function undefinedIfEmpty(obj: ObjectLiteral) {
  if (isEmpty(obj)) {
    return undefined;
  }
  return obj;
}

export function deepCopyJson<T extends JsonCompatible<{}>>(inObj: T): T {
  return JSON.parse(JSON.stringify(inObj)) as T;
}

export function deepCopy<T>(inObject: T): T {
  let value: any, key: any;

  if (typeof inObject !== 'object' || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  const outObject = Array.isArray(inObject) ? [] : {};

  for (key in inObject) {
    value = (inObject as any)[key];

    // Recursively (deep) copy for nested objects, including arrays
    (outObject as any)[key] = deepCopy(value);
  }

  return outObject as T;
}

export function shallowCopy<T>(inObject: T): T {
  if (typeof inObject !== 'object' || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  } else {
    // shallow copy via object spread
    return { ...inObject };
  }
}

export function removeProp<T extends ObjectLiteral, U extends keyof T>(obj: T, key: U): Omit<T, U> {
  const { [key]: removed, ...rest } = obj;
  return rest;
}
