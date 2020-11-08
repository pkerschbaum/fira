import { nanoid, customAlphabet } from 'nanoid';

const ID_SIZE = 10;

export const uniqueIdGenerator = {
  generate: (config?: { alphabet?: string; size: number }) => {
    if (config === undefined) {
      return nanoid(ID_SIZE);
    } else {
      if (config.alphabet === undefined) {
        return nanoid(config.size);
      } else {
        return customAlphabet(config.alphabet, config.size)();
      }
    }
  },
};
