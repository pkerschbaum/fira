module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', '../tsconfig.json'],
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    ...require('../.eslintrc.base.js').rules,
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.entity.ts', '*.dto.ts'],
      rules: {
        '@typescript-eslint/explicit-member-accessibility': ['off'],
      },
    },
  ],
};
