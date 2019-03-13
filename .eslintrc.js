module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2018
  },
  globals: {
    c: 'readable',
    a: 'readable',
    mozPaintCount: 'readable'
  },
  rules: {
    indent: ['error', 2],
    'no-console': 'off',
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
  }
};
