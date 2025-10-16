// File: eslint.config.mjs
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
    {
        files: ['**/*.ts'],
        plugins: {
            '@typescript-eslint': typescriptEslint
        },
        languageOptions: {
            parser: parser,
            parserOptions: {
                ecmaVersion: 6,
                sourceType: 'module'
            }
        },
        rules: {
            '@typescript-eslint/naming-convention': 'warn',
            '@typescript-eslint/semi': 'warn',
            'curly': 'warn',
            'eqeqeq': 'warn',
            'no-throw-literal': 'warn',
            'semi': 'off'
        }
    }
];
