import globals from 'globals';
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  {
    ignores: ['_dist/**', 'dev-dist/**'],
  },
  {
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node, // for tests
      },
    },
  },

  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs['recommended-latest'],
  {
    rules: {
      'react/prop-types': 'off',
      'react/display-name': 'off',
    },
  },

  // Must be the last
  prettierRecommended,
]);
