// @ts-check

import pluginJs from '@eslint/js';
import pluginRouter from '@tanstack/eslint-plugin-router';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

// Add names to TanStack Router configs for better identification in ESLint output
const namedRouterConfigs = pluginRouter.configs['flat/recommended'].map(
  (config, i) => ({
    name: config.name ?? `TanStack Router (#${i + 1})`,
    ...config,
  }),
);

const languageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  globals: globals.browser,
};

const languageOptionsConfig = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  globals: globals.node,
};

export default defineConfig([
  globalIgnores(['dist', 'src/routeTree.gen.ts']),
  ...namedRouterConfigs,
  {
    name: 'App TypeScript Files',
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      ...tsEslint.configs.recommendedTypeChecked,
      pluginReactHooks.configs.flat.recommended,
      pluginReactRefresh.configs.vite,
    ],
    languageOptions: {
      ...languageOptions,
      parserOptions: { project: './tsconfig.app.json' },
    },
    rules: {
      // Disallow inline type imports (use regular imports instead)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'no-type-imports',
        },
      ],
    },
  },
  {
    name: 'App JavaScript Files',
    files: ['src/**/*.{js,jsx,mjs,cjs}'],
    extends: [pluginJs.configs.recommended],
    languageOptions,
  },
  {
    name: 'Import Sorting',
    plugins: {
      import: pluginImport,
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
  {
    name: 'Config TypeScript Files',
    files: ['*.ts'],
    extends: [...tsEslint.configs.recommendedTypeChecked],
    languageOptions: {
      ...languageOptionsConfig,
      parserOptions: { project: './tsconfig.node.json' },
    },
  },
  {
    name: 'Config JavaScript Files',
    files: ['*.js'],
    extends: [pluginJs.configs.recommended],
    languageOptions: languageOptionsConfig,
  },
  prettierConfig,
]);
