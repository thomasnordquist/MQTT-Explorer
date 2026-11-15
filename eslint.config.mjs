import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const sharedRules = {
  semi: ['error', 'never'],
  'max-len': 'warn',
  'no-else-return': 'warn',
  'import/prefer-default-export': 'warn',
  'arrow-parens': 'warn',
  'import/no-extraneous-dependencies': [
    'warn',
    {
      devDependencies: ['**/*.spec.ts', '**/*.spec.tsx', '**/__tests__/**', 'scripts/**', 'src/spec/**'],
      optionalDependencies: true,
      peerDependencies: false,
    },
  ],
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/no-unused-expressions': [
    'warn',
    {
      allowShortCircuit: true,
      allowTernary: true,
    },
  ],
  'object-shorthand': 'warn',
  'prefer-template': 'warn',
  'no-plusplus': 'warn',
  'class-methods-use-this': 'warn',
  'consistent-return': 'warn',
  'import/extensions': 'warn',
  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': 'warn',
  'no-use-before-define': 'off',
  '@typescript-eslint/no-use-before-define': 'warn',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  'import/no-cycle': 'warn',
  'import/no-relative-packages': 'warn',
  'operator-linebreak': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn',
  'prefer-destructuring': 'warn',
  'arrow-body-style': 'warn',
  'import/order': 'warn',
  'object-curly-newline': 'warn',
  'import/no-named-default': 'warn',
  'no-console': 'warn',
  'func-names': 'warn',
  'no-await-in-loop': 'warn',
  'no-restricted-syntax': 'warn',
  'no-continue': 'warn',
  'no-promise-executor-return': 'warn',
  'no-eval': 'warn',
  radix: 'warn',
  'no-param-reassign': 'warn',
  'no-underscore-dangle': 'warn',
  'no-restricted-globals': 'warn',
  'global-require': 'warn',
  '@typescript-eslint/no-require-imports': 'warn',
  eqeqeq: ['warn', 'always', { null: 'ignore' }],
  'no-var': 'warn',
  'prefer-const': 'warn',
  'no-unused-expressions': 'off',
  curly: 'warn',
  'no-duplicate-imports': 'warn',
  'prefer-arrow-callback': 'warn',
  'no-trailing-spaces': 'warn',
}

const reactRules = {
  'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
  'react/prop-types': 'off',
  'react/react-in-jsx-scope': 'off',
  'react/jsx-props-no-spreading': 'warn',
  'jsx-a11y/click-events-have-key-events': 'warn',
  'jsx-a11y/no-static-element-interactions': 'warn',
  'react/destructuring-assignment': 'warn',
  'react/no-access-state-in-setstate': 'warn',
  'react/sort-comp': 'warn',
  'react/no-unused-state': 'warn',
  'react/state-in-constructor': 'warn',
  'react/static-property-placement': 'warn',
  'react/no-array-index-key': 'warn',
  'react/display-name': 'warn',
  'react/require-default-props': 'warn',
  'react/jsx-no-bind': 'warn',
  'react-hooks/rules-of-hooks': 'warn',
  'react/jsx-boolean-value': 'warn',
  'react/jsx-one-expression-per-line': 'warn',
  'react/function-component-definition': 'warn',
  'react/no-unescaped-entities': 'warn',
}

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'app/build/**',
      'backend/build/**',
      '**/*.js',
      '!scripts/**/*.js',
      '!**/*.config.js',
      '!**/*.config.mjs',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      'no-unsafe-optional-chaining': 'warn',
      'no-empty': 'warn',
      'no-prototype-builtins': 'warn',
      'no-useless-catch': 'warn',
      'no-async-promise-executor': 'warn',
      'no-eval': 'warn',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: sharedRules,
  },
  {
    files: ['app/**/*.tsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactRules,
      'max-len': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
)
