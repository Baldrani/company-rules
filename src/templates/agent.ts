import { AgentConfig } from '../../types';
import { defaultRules } from '../rules';

export const agentTemplates: { [key: string]: AgentConfig } = {
  claude: {
    name: 'Claude AI Assistant',
    rules: [
      ...defaultRules,
      {
        id: 'claude-context-awareness',
        name: 'Context Awareness',
        description: 'Maintain awareness of project structure and conventions',
        type: 'custom',
        severity: 'info',
        enabled: true,
        config: {
          analyzeProjectStructure: true,
          followExistingPatterns: true
        }
      },
      {
        id: 'claude-defensive-security',
        name: 'Defensive Security Only',
        description: 'Only assist with defensive security tasks',
        type: 'security',
        severity: 'error',
        enabled: true,
        config: {
          allowDefensiveSecurity: true,
          blockMaliciousCode: true
        }
      }
    ],
    capabilities: [
      'code-analysis',
      'refactoring',
      'debugging',
      'testing',
      'documentation',
      'security-analysis'
    ],
    restrictions: [
      'no-malicious-code',
      'no-data-extraction',
      'follow-company-conventions'
    ]
  },
  copilot: {
    name: 'GitHub Copilot',
    rules: [
      ...defaultRules.filter(rule => rule.type === 'lint' || rule.type === 'format'),
      {
        id: 'copilot-suggestions',
        name: 'Smart Suggestions',
        description: 'Provide contextually relevant code suggestions',
        type: 'custom',
        severity: 'info',
        enabled: true,
        config: {
          contextLines: 10,
          respectExistingStyle: true
        }
      }
    ],
    capabilities: [
      'code-completion',
      'snippet-generation',
      'comment-to-code'
    ],
    restrictions: [
      'respect-licensing',
      'no-sensitive-data'
    ]
  },
  cursor: {
    name: 'Cursor AI',
    rules: [
      ...defaultRules,
      {
        id: 'cursor-composer',
        name: 'Composer Rules',
        description: 'Rules for multi-file editing with Cursor Composer',
        type: 'custom',
        severity: 'info',
        enabled: true,
        config: {
          planBeforeExecution: true,
          explainChanges: true,
          maintainConsistency: true
        }
      },
      {
        id: 'cursor-chat',
        name: 'Chat Guidelines',
        description: 'Guidelines for Cursor chat interactions',
        type: 'custom',
        severity: 'info',
        enabled: true,
        config: {
          provideContext: true,
          askClarifyingQuestions: true
        }
      }
    ],
    capabilities: [
      'multi-file-editing',
      'code-generation',
      'refactoring',
      'chat-assistance'
    ],
    restrictions: [
      'maintain-project-structure',
      'follow-team-conventions'
    ]
  }
};