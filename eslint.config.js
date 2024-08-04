import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'
import jest from 'eslint-plugin-jest'

const ignores = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.d.ts',
  '**/__mocks__/**',
  '**/*.{md,mdx}',
  '**/scratch/**',
]

export default [
  // Base JavaScript configuration
  js.configs.recommended,
  // Global ignore
  {
    ignores,
  },
  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Prettier configuration
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
      ...prettier.rules,
    },
  },

  // Jest configuration
  {
    files: ['**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
    ...jest.configs['flat/recommended'],
  },
]
