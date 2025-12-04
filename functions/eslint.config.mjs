// @ts-check
/// <reference types="node" />
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig(
  {
    name: 'Global Ignored Files',
    ignores: [
      'lib/**/*',
      'eslint.config.mjs',
      'package-lock.json',
      'src/datastore/types/generated.ts',
    ],
  },
  { name: 'Eslint Recommended', ...eslint.configs.recommended },
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.strictTypeChecked[2],
  tseslint.configs.stylisticTypeChecked[2],
  {
    name: 'TypeScript ESLint Plugin Configuration',
    languageOptions: {
      parserOptions: {
        project: './tsconfig.dev.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/unified-signatures': 'off', // Disabled due to ESLint bug with generics
    },
  },
  {
    name: 'Import Plugin Configuration',
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js built-in modules
            'external', // npm packages
            'internal', // Internal modules
            'parent', // Parent directories
            'sibling', // Same directory
            'index', // Index files
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  { name: 'Prettier Configuration', ...eslintConfigPrettier },
);
