export interface IDEConfig {
    name: string;
    settings: Record<string, any>;
    extensions?: string[];
    tasks?: Task[];
}
export interface Task {
    label: string;
    type: string;
    command: string;
    group?: string;
    args?: string[];
}
export interface AgentConfig {
    name: string;
    rules: Rule[];
    capabilities: string[];
    restrictions?: string[];
}
export interface Rule {
    id: string;
    name: string;
    description: string;
    type: 'lint' | 'format' | 'security' | 'performance' | 'custom';
    severity: 'error' | 'warning' | 'info';
    enabled: boolean;
    config?: Record<string, any>;
}
export interface CompanyRulesConfig {
    ide: IDEConfig[];
    agent: AgentConfig[];
    global: {
        typescript: boolean;
        eslint: boolean;
        prettier: boolean;
        husky: boolean;
    };
}
//# sourceMappingURL=index.d.ts.map