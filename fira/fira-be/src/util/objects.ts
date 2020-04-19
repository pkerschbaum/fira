export function isEmpty(obj: { [prop: string]: any }) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

export function undefinedIfEmpty(obj: { [prop: string]: any }) {
  if (isEmpty(obj)) {
    return undefined;
  }
  return obj;
}
