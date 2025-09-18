import globals from 'globals';
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { fixupPluginRules } from '@eslint/compat';
import youDontNeedLodashUnderscore from 'eslint-plugin-you-dont-need-lodash-underscore';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import promise from 'eslint-plugin-promise';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig([
  {
    ignores: ['_dist/**', 'dev-dist/**'],
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // for tests
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import-x/resolver-next': [createNodeResolver({ extensions: ['.js', '.jsx', '.mjs'] })],
    },
  },

  js.configs.recommended,
  importX.flatConfigs.recommended,
  promise.configs['flat/recommended'],
  {
    plugins: { unicorn },
    rules: {
      'unicorn/better-regex': ['error', { sortCharacterClasses: false }],
      'unicorn/escape-case': 'error',
      'unicorn/explicit-length-check': 'error',
      'unicorn/filename-case': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-set-has': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
    },
  },
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  {
    plugins: {
      'you-dont-need-lodash-underscore': fixupPluginRules(youDontNeedLodashUnderscore),
    },
    rules: {
      ...youDontNeedLodashUnderscore.configs['compatible-warn'].rules,
    },
  },
  {
    rules: {
      'no-console': 'error',
      'no-constant-condition': 'error',

      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-no-target-blank': 'off', // TODO turn it on
      complexity: ['warn', { max: 20 }],
    },
  },

  // Must be the last
  prettierRecommended,
]);
