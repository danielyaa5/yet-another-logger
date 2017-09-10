// ESLint configuration
// http://eslint.org/docs/user-guide/configuring
module.exports = {
  parser: 'babel-eslint',

  extends: [
    'airbnb',
    'plugin:css-modules/recommended',
  ],

  plugins: [
    'css-modules',
  ],

  globals: {
    __DEV__: true,
  },

  env: {
    browser: true,
  },

  rules: {
    // `js` and `jsx` are common extensions
    // `mjs` is for `universal-router` only, for now
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        jsx: 'never',
        mjs: 'never',
      },
    ],

    // Not supporting nested package.json yet
    // https://github.com/benmosher/eslint-plugin-import/issues/458
    'import/no-extraneous-dependencies': 'off',

    // Recommend not to leave any console.log in your code
    // Use console.error, console.warn and console.info instead
    'no-console': [
      'error',
      {
        allow: ['warn', 'error', 'info'],
      },
    ],


    // allow function hoising
    'no-use-before-define': ['error', { 'functions': false }],
    'consistent-return': 'off',
    'no-plusplus': 'off',
    'no-param-reassign': 'off',
    'no-await-in-loop': 'off',
    'arrow-body-style': 'off',
    'no-continue': 'off',
    'indent': 'off',
    'no-restricted-syntax': 'off',
    'max-len': [2, 125, 4],
    'no-underscore-dangle': 'off',
    'func-names': 'off',
  },

  settings: {
    // Allow absolute paths in imports, e.g. import Button from 'components/Button'
    // https://github.com/benmosher/eslint-plugin-import/tree/master/resolvers
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
};
