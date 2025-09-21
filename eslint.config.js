import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // 1. Ignore files and directories
  {
    ignores: ['dist', 'coverage'],
  },

  // 2. Extend recommended configurations from ESLint and TypeScript-ESLint
  ...tseslint.configs.recommended,

  // 3. Define language and environment options for TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es2020,
      },
    },
  },

  // 4. Override specific rules (place this last to ensure it overrides everything else)
  {
    files: ['tests/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // 5. Add Prettier plugin and config for formatting
  {
    files: ['**/*.ts'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  prettierConfig,
];
