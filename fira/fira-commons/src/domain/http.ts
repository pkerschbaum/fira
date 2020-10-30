export const EXCEPTION_CODES = {
  EXAMPLE_ERROR: { EXAMPLE_CODE_1: 450 },
} as const;

export type EXCEPTION_DATA = {
  [EXCEPTION_CODES.EXAMPLE_ERROR.EXAMPLE_CODE_1]: {
    exampleData: Array<{ name: string }>;
  };
} & { [notDefinedCodes: number]: undefined };
