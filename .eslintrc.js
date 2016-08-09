module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    commonjs: true,
  },
  'extends': 'eslint:recommended',
  rules: {
    'indent': [
      'error',
      2,
      {
        SwitchCase : 1,
      }
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    quotes: [
      'error',
      'single',
    ],
    // object literal에서 따옴표 안 써도 됨.
    'quote-props': [
      'error',
      'as-needed',
    ],
    'semi': [
      'error',
      'always',
    ],
    'brace-style': [
      'error',
      '1tbs',
    ],
    'keyword-spacing': [
      'error',
      {
        before: true,
        after: true,
      }
    ],
    'space-unary-ops': [
      'error',
    ],
    'space-infix-ops': [
      'error',
    ],
    'space-in-parens': [
      'error',
    ],
    'space-before-function-paren': [
      'error',
      'always',
    ],
    'eqeqeq': [
      'error',
    ],
    'no-undef': [
      'error',
    ],
    'no-unused-vars': [
      'off',
    ],
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
    'arrow-parens': [
      'error',
      'as-needed',
    ],
    'arrow-spacing': [
      'error',
      {
        before: true,
        after: true,
      }
    ],
    'curly': [
      'error',
      'multi-line',
      'consistent',
    ],
  },
};
