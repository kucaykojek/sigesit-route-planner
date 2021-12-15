module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'prettier'
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'brace-style': 'error',
    'comma-dangle': ['error', 'never'],
    curly: 'error',
    'comma-spacing': 'error',
    indent: ['error', 2],
    'linebreak-style': 'error',
    'no-cond-assign': 'error',
    'no-console': 'off',
    'no-trailing-spaces': 'error',
    'no-unused-vars': 'off',
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'import/no-named-as-default': 0,
    'import/no-named-default': 0,
    'no-useless-catch': 'off'
  }
}
