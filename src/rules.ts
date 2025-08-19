import { Rule } from '../types';

export const defaultRules: Rule[] = [
  {
    id: 'typescript-strict',
    name: 'TypeScript Strict Mode',
    description: 'Enforce strict TypeScript compilation',
    type: 'lint',
    severity: 'error',
    enabled: true,
    config: {
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true
    }
  },
  {
    id: 'no-console-logs',
    name: 'No Console Logs',
    description: 'Prevent console.log statements in production code',
    type: 'lint',
    severity: 'warning',
    enabled: true,
    config: {
      allowInDevelopment: true
    }
  },
  {
    id: 'security-no-eval',
    name: 'No eval() Function',
    description: 'Prevent use of eval() for security reasons',
    type: 'security',
    severity: 'error',
    enabled: true
  },
  {
    id: 'performance-async-await',
    name: 'Prefer async/await',
    description: 'Use async/await over Promise chains for better readability',
    type: 'performance',
    severity: 'info',
    enabled: true
  },
  {
    id: 'format-prettier',
    name: 'Prettier Formatting',
    description: 'Enforce consistent code formatting with Prettier',
    type: 'format',
    severity: 'error',
    enabled: true,
    config: {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5'
    }
  }
];