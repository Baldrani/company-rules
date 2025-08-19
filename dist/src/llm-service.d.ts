import { Instruction } from './parser';
export interface LLMConfig {
    provider: 'openai' | 'anthropic';
    apiKey: string;
    model?: string;
}
export declare class LLMService {
    private config;
    constructor(config: LLMConfig);
    expandInstruction(instruction: Instruction, targetPlatform: 'cursor' | 'vscode' | 'claude' | 'copilot'): Promise<string>;
    private buildPrompt;
    private getPlatformContext;
    private callLLM;
    private callOpenAI;
    private callAnthropic;
    private getFallbackContent;
    static fromEnvironment(): LLMService | null;
}
//# sourceMappingURL=llm-service.d.ts.map