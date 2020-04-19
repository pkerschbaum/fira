export function failIfUndefined<T, U extends any[]>(cb: (...args: U) => Promise<T | undefined>) {
  return async (...args: U) => {
    const result = await cb(...args);
    if (result === undefined) {
      throw new Error(`entity not found`);
    }
    return result;
  };
}
