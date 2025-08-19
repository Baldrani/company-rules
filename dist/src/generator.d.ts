import { ParsedInstructions } from './parser';
export interface PreviewItem {
    path: string;
    type: 'file' | 'directory';
    size?: number;
    preview?: string;
}
export declare class FileGenerator {
    generate(instructions: ParsedInstructions): Promise<void>;
    preview(instructions: ParsedInstructions): Promise<PreviewItem[]>;
    private generateIDEConfig;
    private generateAgentConfig;
    private previewIDEConfig;
    private previewAgentConfig;
    private generateCursorRules;
    private generateVSCodeSettings;
    private generatePhpStormSettings;
    private generateClaudeConfig;
    private generateCopilotConfig;
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