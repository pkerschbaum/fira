export function isTypeError(e: any): boolean {
  return typeof e?.toString === 'function' && /.*TypeError.*/i.test(e.toString() as string);
}
