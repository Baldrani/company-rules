import { Instruction } from './parser';
export interface GeneratorInstructions {
    ides: string[];
    agents: string[];
    instructions: Instruction[];
}
export interface PreviewItem {
    path: string;
    type: 'file' | 'directory';
    size?: number;
    preview?: string;
}
export declare class FileGenerator {
    private llmService;
    private basePath;
    constructor(basePath?: string);
    generate(instructions: GeneratorInstructions): Promise<void>;
    preview(instructions: GeneratorInstructions): Promise<PreviewItem[]>;
    private generateIDEConfig;
    private generateAgentConfig;
    private previewIDEConfig;
    private previewAgentConfig;
    private generateCursorRules;
    private generateVSCodeSettings;
    private generateJetBrainsSettings;
    private generateSublimeSettings;
    private generateVimConfig;
    private generateEmacsConfig;
    private generateClaudeConfig;
    private generateCopilotConfig;
    private generateCodeiumConfig;
    private generateTabnineConfig;
    private generateChatGPTConfig;
    private generateGeminiConfig;
    private generateSourcegraphConfig;
    private generateAmazonQConfig;
    private updateGitignore;
    private sanitizeFilename;
    private previewCursorRules;
    private previewVSCodeSettings;
    private previewPhpStormSettings;
    private previewClaudeConfig;
    private previewCopilotConfig;
    private previewGitignore;
}
//# sourceMappingURL=generator.d.ts.map