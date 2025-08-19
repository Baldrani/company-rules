import { ParsedInstructions } from './parser';
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
    generate(instructions: ParsedInstructions): Promise<void>;
    preview(instructions: ParsedInstructions): Promise<PreviewItem[]>;
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