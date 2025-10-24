import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        crypto: 'readonly'
      }
    },
    rules: {
      // Enforce ES Module standards
      'no-undef': 'error',
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      
      // Code quality
      'no-console': 'off', // Allow console for logging in this project
      'no-constant-condition': 'warn',
      'no-empty': ['error', { allowEmptyCatch: true }],
      
      // Best practices
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',
      
      // Style consistency
      'semi': ['error', 'always'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
      'indent': ['warn', 2, { SwitchCase: 1 }],
      'comma-dangle': ['warn', 'never'],
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
      
      // Project-specific: NO SIMULATIONS enforcement
      'no-magic-numbers': 'off', // Allow port numbers, timeouts, etc.
      'max-lines-per-function': 'off', // Some clones have longer methods
      'complexity': 'off' // Don't enforce cyclomatic complexity yet
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      'no-unused-expressions': 'off' // Chai assertions use expressions
    }
  },
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      '.git/**',
      '.github/**',
      '.specstory/**',
      'docker/**',
      '*.md'
    ]
  }
];
