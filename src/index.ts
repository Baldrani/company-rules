import { CompanyRulesConfig, IDEConfig, AgentConfig, Rule } from '../types';

export class CompanyRulesManager {
  private config: CompanyRulesConfig;

  constructor(config?: Partial<CompanyRulesConfig>) {
    this.config = {
      ide: [],
      agent: [],
      global: {
        typescript: true,
        eslint: true,
        prettier: true,
        husky: true
      },
      ...config
    };
  }

  public getIDEConfig(ideName: string): IDEConfig | undefined {
    return this.config.ide.find(ide => ide.name === ideName);
  }

  public getAgentConfig(agentName: string): AgentConfig | undefined {
    return this.config.agent.find(agent => agent.name === agentName);
  }

  public addRule(target: 'ide' | 'agent', targetName: string, rule: Rule): void {
    if (target === 'ide') {
      const ideConfig = this.config.ide.find(ide => ide.name === targetName);
      if (ideConfig) {
        // IDE rules would be stored in settings
        ideConfig.settings.rules = ideConfig.settings.rules || [];
        ideConfig.settings.rules.push(rule);
      }
    } else {
      const agentConfig = this.config.agent.find(agent => agent.name === targetName);
      if (agentConfig) {
        agentConfig.rules.push(rule);
      }
    }
  }

  public instantiateForProject(projectPath: string): {
    ideConfigs: IDEConfig[];
    agentConfigs: AgentConfig[];
    setupInstructions: string[];
  } {
    const setupInstructions: string[] = [];
    
    if (this.config.global.typescript) {
      setupInstructions.push('Initialize TypeScript configuration');
    }
    if (this.config.global.eslint) {
      setupInstructions.push('Set up ESLint with company rules');
    }
    if (this.config.global.prettier) {
      setupInstructions.push('Configure Prettier formatting');
    }
    if (this.config.global.husky) {
      setupInstructions.push('Install Husky git hooks');
    }

    return {
      ideConfigs: this.config.ide,
      agentConfigs: this.config.agent,
      setupInstructions
    };
  }

  public exportConfig(): CompanyRulesConfig {
    return { ...this.config };
  }
}

export * from '../types';
export { defaultRules } from './rules';
export { ideTemplates } from './templates/ide';
export { agentTemplates } from './templates/agent';
export { InstructionParser } from './parser';
export { FileGenerator } from './generator';