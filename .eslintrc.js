/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn', // warn instead of error
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // ignore unused vars starting with _
    
    // React
    'react-hooks/exhaustive-deps': 'warn', // warn instead of error
    
    // General
    'prefer-const': 'warn',
    'no-console': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
