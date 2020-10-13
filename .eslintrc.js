/* global CONFIG */
require('@babel/register');
require('./config/lib/loader-node');

module.exports = {
  extends: ['eslint:recommended', 'prettier', 'prettier/react'],
  parser: '@babel/eslint-parser',
  plugins: [
    'babel',
    'import',
    'lodash',
    'prettier',
    'promise',
    'react',
    'you-dont-need-lodash-underscore',
    'react-hooks',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    babelOptions: {
      configFile: './.babelrc',
      plugins: ['@babel/syntax-do-expressions'],
      presets: ['@babel/preset-react'],
    },
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    'import/extensions': ['.js', '.jsx'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    curly: 2,
    'func-name-matching': 2,
    'import/default': 2,
    'import/named': 2,
    'import/namespace': 2,
    'import/no-duplicates': 2,
    'import/no-extraneous-dependencies': 2,
    'import/no-named-as-default': 2,
    'import/no-named-as-default-member': 2,
    'import/no-unresolved': 2,
    'import/order': [
      2,
      { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'] },
    ],
    indent: 'off',
    // By default the eslint-linebreak-style directive requires "windows" linebreaks
    // on Windows platform and "unix" linebreaks otherwise.
    // You can override this behavior by setting the eslint.linebreakStyle config
    // parameter explicitly to "windows" or "unix".
    'linebreak-style': [
      2,
      CONFIG.eslint.linebreakStyle || (process.platform === 'win32' ? 'windows' : 'unix'),
    ],
    'max-statements-per-line': [2, { max: 1 }],
    'no-debugger': 2,
    'no-duplicate-imports': 2,
    'no-else-return': 2,
    'no-global-assign': 2,
    'no-lonely-if': 2,
    'no-native-reassign': 2,
    'no-tabs': 2,
    'no-template-curly-in-string': 2,
    'no-throw-literal': 2,
    'no-undef': 2,
    'no-unneeded-ternary': 2,
    'no-unsafe-negation': 2,
    'no-useless-computed-key': 2,
    'no-var': 2,
    'no-warning-comments': 1,
    'object-shorthand': 2,
    'prefer-const': 2,
    'prefer-destructuring': 2,
    'prefer-numeric-literals': 1,
    'prefer-rest-params': 2,
    'prefer-spread': 2,
    'prefer-template': 2,
    'require-atomic-updates': 0,
    'require-yield': 0,

    'prettier/prettier': 'error',

    'react/jsx-key': 2,
    'react/jsx-no-bind': 2,
    'react/jsx-no-duplicate-props': 2,
    'react/jsx-no-undef': 2,
    'react/jsx-pascal-case': 1,
    'react/jsx-uses-react': 2,
    'react/jsx-uses-vars': 2,
    'react/no-children-prop': 2,
    'react/no-danger': 2,
    'react/no-deprecated': 2,
    'react/no-did-mount-set-state': 1,
    'react/no-did-update-set-state': 1,
    'react/no-direct-mutation-state': 2,
    'react/no-is-mounted': 1,
    'react/no-multi-comp': 0,
    'react/no-redundant-should-component-update': 2,
    'react/no-set-state': 0,
    'react/no-string-refs': 2,
    'react/no-typos': 2,
    'react/no-unescaped-entities': 2,
    'react/no-unknown-property': 2,
    'react/self-closing-comp': 2,
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
