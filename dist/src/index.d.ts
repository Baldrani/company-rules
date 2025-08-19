import { CompanyRulesConfig, IDEConfig, AgentConfig, Rule } from '../types';
export declare class CompanyRulesManager {
    private config;
    constructor(config?: Partial<CompanyRulesConfig>);
    getIDEConfig(ideName: string): IDEConfig | undefined;
    getAgentConfig(agentName: string): AgentConfig | undefined;
    addRule(target: 'ide' | 'agent', targetName: string, rule: Rule): void;
    instantiateForProject(projectPath: string): {
        ideConfigs: IDEConfig[];
        agentConfigs: AgentConfig[];
        setupInstructions: string[];
    };
    exportConfig(): CompanyRulesConfig;
}
export * from '../types';
export { defaultRules } from './rules';
export { ideTemplates } from './templates/ide';
export { agentTemplates } from './templates/agent';
export { InstructionParser } from './parser';
export { FileGenerator } from './generator';
//# sourceMappingURL=index.d.ts.map