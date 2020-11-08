export function isEmpty(str: string): boolean {
  return str.trim().length === 0;
}

export function isNullishOrEmpty(str: string | undefined | null): str is undefined | null | '' {
  return str === undefined || str === null || isEmpty(str);
}

export function capitalizeFirstLetter(str: string): string {
  return str.length === 0 ? str : str.charAt(0).toUpperCase() + str.slice(1);
}
