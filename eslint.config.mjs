import globals from 'globals';
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { fixupPluginRules } from '@eslint/compat';
import youDontNeedLodashUnderscore from 'eslint-plugin-you-dont-need-lodash-underscore';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';

export default defineConfig([
  {
    ignores: ['_dist/**', 'dev-dist/**'],
  },
  {
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
      'import-x/resolver-next': [createNodeResolver({ extensions: ['.js', '.jsx'] })],
    },
  },

  js.configs.recommended,
  importX.flatConfigs.recommended,
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
      'react/prop-types': 'off',
      'react/display-name': 'off',
      complexity: ['warn', { max: 20 }],
    },
  },

  // Must be the last
  prettierRecommended,
]);
