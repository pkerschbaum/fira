import { nanoid, customAlphabet } from 'nanoid';

const ID_SIZE = 10;

export const uniqueIdGenerator = {
  generate: (config?: { alphabet: string; size: number }) => {
    if (config === undefined) {
      return nanoid(ID_SIZE);
    } else {
      return customAlphabet(config.alphabet, config.size)();
    }
  },
};
