module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    commonjs: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    eqeqeq: ['error'],
    'no-undef': ['error'],
    'no-unused-vars': ['error'],
    'prefer-const': ['error'],
    'prefer-numeric-literals': ['error'],
    'no-const-assign': ['error'],
    'no-var': ['error'],
    'prefer-arrow-callback': ['error'],
    'no-console': ['off'],
    'arrow-parens': ['error', 'as-needed'],
  },
}
