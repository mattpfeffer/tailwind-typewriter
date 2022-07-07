module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: ['standard', 'prettier'],
    globals: {},
    env: {
        node: true,
        es2018: true,
        amd: true,
        browser: true,
        jest: true
    },
    parserOptions: {
        ecmaFeatures: {},
        ecmaVersion: 2018
    },
    plugins: ['@typescript-eslint'],
    settings: {},
    rules: {
        'no-console': 'warn'
    }
};
