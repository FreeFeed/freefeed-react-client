module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-prettier/recommended'],
  rules: {
    'no-descending-specificity': null,
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],

    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'scss/dollar-variable-pattern': null,
    'scss/at-function-pattern': null,
    'keyframes-name-pattern': null,
    'value-keyword-case': null,
    'function-name-case': null,

    'value-no-vendor-prefix': null,
    'property-no-vendor-prefix': null,
    'at-rule-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,

    'color-hex-length': null,
    'scss/comment-no-empty': null,
    'alpha-value-notation': 'number',

    'scss/at-extend-no-missing-placeholder': null,
    'scss/at-import-partial-extension': null,

    'color-function-notation': [null, 'TODO: check it later'],
    'scss/no-global-function-names': [null, 'TODO: check it later'],
  },
};
