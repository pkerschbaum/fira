import nanoid = require('nanoid');
import generate = require('nanoid/generate');

const ID_SIZE = 10;

export const uniqueIdGenerator = {
  generate: (config?: { alphabet: string; size: number }) => {
    if (config === undefined) {
      return nanoid(ID_SIZE);
    } else {
      return generate(config.alphabet, config.size);
    }
  },
};
