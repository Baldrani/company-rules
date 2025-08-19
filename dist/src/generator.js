"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileGenerator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const llm_service_1 = require("./llm-service");
class FileGenerator {
    constructor(basePath = './') {
        this.llmService = llm_service_1.LLMService.fromEnvironment();
        this.basePath = basePath;
    }
    async generate(instructions) {
        // Generate IDE-specific configurations
        for (const ide of instructions.ides) {
            await this.generateIDEConfig(ide, instructions.instructions);
        }
        // Generate agent-specific configurations
        for (const agent of instructions.agents) {
            await this.generateAgentConfig(agent, instructions.instructions);
        }
        // Update .gitignore
        await this.updateGitignore(instructions);
    }
    async preview(instructions) {
        const items = [];
        // Preview IDE-specific configurations
        for (const ide of instructions.ides) {
            items.push(...await this.previewIDEConfig(ide, instructions.instructions));
        }
        // Preview agent-specific configurations
        for (const agent of instructions.agents) {
            items.push(...await this.previewAgentConfig(agent, instructions.instructions));
        }
        // Preview .gitignore updates
        const gitignorePreview = await this.previewGitignore(instructions);
        if (gitignorePreview) {
            items.push(gitignorePreview);
        }
        return items;
    }
    async generateIDEConfig(ide, instructions) {
        switch (ide.toLowerCase()) {
            case 'cursor':
                await this.generateCursorRules(instructions);
                break;
            case 'vscode':
                await this.generateVSCodeSettings(instructions);
                break;
            case 'phpstorm':
            case 'webstorm':
            case 'intellij':
            case 'pycharm':
                await this.generateJetBrainsSettings(instructions, ide);
                break;
            case 'sublime':
                await this.generateSublimeSettings(instructions);
                break;
            case 'vim':
                await this.generateVimConfig(instructions);
                break;
            case 'emacs':
                await this.generateEmacsConfig(instructions);
                break;
            default:
                console.log(`⚠️  IDE "${ide}" configuration not implemented yet`);
        }
    }
    async generateAgentConfig(agent, instructions) {
        switch (agent.toLowerCase()) {
            case 'claude':
                await this.generateClaudeConfig(instructions);
                break;
            case 'copilot':
                await this.generateCopilotConfig(instructions);
                break;
            case 'codeium':
                await this.generateCodeiumConfig(instructions);
                break;
            case 'tabnine':
                await this.generateTabnineConfig(instructions);
                break;
            case 'chatgpt':
                await this.generateChatGPTConfig(instructions);
                break;
            case 'gemini':
                await this.generateGeminiConfig(instructions);
                break;
            case 'sourcegraph':
                await this.generateSourcegraphConfig(instructions);
                break;
            case 'amazon-q':
                await this.generateAmazonQConfig(instructions);
                break;
            default:
                console.log(`⚠️  Agent "${agent}" configuration not implemented yet`);
        }
    }
    async previewIDEConfig(ide, instructions) {
        switch (ide.toLowerCase()) {
            case 'cursor':
                return this.previewCursorRules(instructions);
            case 'vscode':
                return this.previewVSCodeSettings(instructions);
            case 'phpstorm':
                return this.previewPhpStormSettings(instructions);
            default:
                return [];
        }
    }
    async previewAgentConfig(agent, instructions) {
        switch (agent.toLowerCase()) {
            case 'claude':
                return this.previewClaudeConfig(instructions);
            case 'copilot':
                return this.previewCopilotConfig(instructions);
            default:
                return [];
        }
    }
    async generateCursorRules(instructions) {
        const cursorDir = path.join(this.basePath, 'cursor/rules');
        // Ensure cursor/rules directory exists
        fs.mkdirSync(cursorDir, { recursive: true });
        // Generate individual rule files
        for (let i = 0; i < instructions.length; i++) {
            const instruction = instructions[i];
            if (!instruction)
                continue;
            const filename = `${String(i + 1).padStart(2, '0')}-${this.sanitizeFilename(instruction.name)}.md`;
            const filepath = path.join(cursorDir, filename);
            let content = `# ${instruction.name}\n\n`;
            if (this.llmService) {
                try {
                    const expandedContent = await this.llmService.expandInstruction(instruction, 'cursor');
                    content += expandedContent;
                }
                catch (error) {
                    content += instruction.description || instruction.name;
                }
            }
            else {
                content += instruction.description || instruction.name;
            }
            if (instruction.files) {
                content += `\n\n**Applies to:** ${instruction.files}`;
            }
            fs.writeFileSync(filepath, content);
        }
    }
    async generateVSCodeSettings(instructions) {
        const vscodeDir = path.join(this.basePath, '.vscode');
        fs.mkdirSync(vscodeDir, { recursive: true });
        const settings = {
            "editor.formatOnSave": true,
            "editor.codeActionsOnSave": {
                "source.fixAll.eslint": true
            },
            // Add instruction-based settings here
        };
        fs.writeFileSync(path.join(vscodeDir, 'settings.json'), JSON.stringify(settings, null, 2));
    }
    async generateJetBrainsSettings(instructions, ide) {
        // Generate JetBrains IDE-specific configuration
        console.log(`${ide} configuration generation not implemented yet`);
    }
    async generateSublimeSettings(instructions) {
        // Generate Sublime Text-specific configuration
        console.log('Sublime Text configuration generation not implemented yet');
    }
    async generateVimConfig(instructions) {
        // Generate Vim/Neovim-specific configuration
        console.log('Vim/Neovim configuration generation not implemented yet');
    }
    async generateEmacsConfig(instructions) {
        // Generate Emacs-specific configuration
        console.log('Emacs configuration generation not implemented yet');
    }
    async generateClaudeConfig(instructions) {
        let content = `# Project Instructions for Claude\n\n`;
        content += `This file contains project-specific instructions for Claude AI assistant.\n\n`;
        content += `## Code Guidelines\n\n`;
        for (const instruction of instructions) {
            if (!instruction)
                continue;
            content += `### ${instruction.name}\n\n`;
            if (this.llmService) {
                try {
                    const expandedContent = await this.llmService.expandInstruction(instruction, 'claude');
                    content += expandedContent;
                }
                catch (error) {
                    content += instruction.description || instruction.name;
                }
            }
            else {
                content += instruction.description || instruction.name;
            }
            if (instruction.files) {
                content += `\n\n**Files:** ${instruction.files}`;
            }
            content += `\n\n`;
        }
        content += `\n---\n\n`;
        content += `*Generated by @company/rules-package from project-specific instructions.yml*\n`;
        fs.writeFileSync(path.join(this.basePath, 'CLAUDE.md'), content);
    }
    async generateCopilotConfig(instructions) {
        let content = `# GitHub Copilot Instructions\n\n`;
        content += `Project-specific instructions for GitHub Copilot.\n\n`;
        for (const instruction of instructions) {
            if (!instruction)
                continue;
            content += `## ${instruction.name}\n\n`;
            if (this.llmService) {
                try {
                    const expandedContent = await this.llmService.expandInstruction(instruction, 'copilot');
                    content += expandedContent;
                }
                catch (error) {
                    content += instruction.description || instruction.name;
                }
            }
            else {
                content += instruction.description || instruction.name;
            }
            if (instruction.files) {
                content += `\n\n**Applies to:** ${instruction.files}`;
            }
            content += `\n\n`;
        }
        content += `\n---\n\n`;
        content += `*Generated by @company/rules-package from project-specific instructions.yml*\n`;
        fs.writeFileSync(path.join(this.basePath, 'copilot-instructions.md'), content);
    }
    async generateCodeiumConfig(instructions) {
        // Generate Codeium-specific configuration
        console.log('Codeium configuration generation not implemented yet');
    }
    async generateTabnineConfig(instructions) {
        // Generate Tabnine-specific configuration  
        console.log('Tabnine configuration generation not implemented yet');
    }
    async generateChatGPTConfig(instructions) {
        // Generate ChatGPT-specific configuration
        console.log('ChatGPT configuration generation not implemented yet');
    }
    async generateGeminiConfig(instructions) {
        // Generate Google Gemini-specific configuration
        console.log('Google Gemini configuration generation not implemented yet');
    }
    async generateSourcegraphConfig(instructions) {
        // Generate Sourcegraph Cody-specific configuration
        console.log('Sourcegraph Cody configuration generation not implemented yet');
    }
    async generateAmazonQConfig(instructions) {
        // Generate Amazon Q Developer-specific configuration
        console.log('Amazon Q Developer configuration generation not implemented yet');
    }
    async updateGitignore(instructions) {
        const gitignorePath = path.join(this.basePath, '.gitignore');
        let gitignoreContent = '';
        // Read existing .gitignore if it exists
        if (fs.existsSync(gitignorePath)) {
            gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        }
        const newEntries = [];
        // Add cursor rules to gitignore if cursor is used
        if (instructions.ides.includes('cursor')) {
            if (!gitignoreContent.includes('cursor/rules/')) {
                newEntries.push('cursor/rules/');
            }
        }
        // Add the new entries to .gitignore
        if (newEntries.length > 0) {
            if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
                gitignoreContent += '\n';
            }
            gitignoreContent += '\n# Generated by @launchmetrics/rules-package\n';
            gitignoreContent += '# WARNING: Do not manually add generated files to git - they should remain gitignored\n';
            gitignoreContent += newEntries.join('\n') + '\n';
            fs.writeFileSync(gitignorePath, gitignoreContent);
        }
    }
    sanitizeFilename(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 50);
    }
    // Preview methods
    previewCursorRules(instructions) {
        const items = [];
        // Directory entry
        items.push({
            path: path.join(this.basePath, 'cursor/rules/'),
            type: 'directory'
        });
        // Individual rule files
        for (let i = 0; i < instructions.length; i++) {
            const instruction = instructions[i];
            if (!instruction)
                continue;
            const filename = `${String(i + 1).padStart(2, '0')}-${this.sanitizeFilename(instruction.name)}.md`;
            const filepath = path.join(this.basePath, 'cursor/rules', filename);
            let content = `# ${instruction.name}\n\n`;
            content += instruction.description || instruction.name;
            if (instruction.files) {
                content += `\n\n**Applies to:** ${instruction.files}`;
            }
            items.push({
                path: filepath,
                type: 'file',
                size: content.length,
                preview: content.slice(0, 200) + (content.length > 200 ? '...' : '')
            });
        }
        return items;
    }
    previewVSCodeSettings(instructions) {
        const settings = {
            "editor.formatOnSave": true,
            "editor.codeActionsOnSave": {
                "source.fixAll.eslint": true
            },
            // Add instruction-based settings here
        };
        const content = JSON.stringify(settings, null, 2);
        return [{
                path: path.join(this.basePath, '.vscode/settings.json'),
                type: 'file',
                size: content.length,
                preview: content.slice(0, 200) + (content.length > 200 ? '...' : '')
            }];
    }
    previewPhpStormSettings(instructions) {
        return [{
                path: path.join(this.basePath, '.idea/workspace.xml'),
                type: 'file',
                preview: '<!-- PhpStorm configuration generation not implemented yet -->'
            }];
    }
    previewClaudeConfig(instructions) {
        let content = `# Project Instructions for Claude\n\n`;
        content += `This file contains project-specific instructions for Claude AI assistant.\n\n`;
        content += `## Code Guidelines\n\n`;
        for (const instruction of instructions) {
            if (!instruction)
                continue;
            content += `### ${instruction.name}\n\n`;
            content += instruction.description || instruction.name;
            if (instruction.files) {
                content += `\n\n**Files:** ${instruction.files}`;
            }
            content += `\n\n`;
        }
        content += `\n---\n\n`;
        content += `*Generated by @company/rules-package from project-specific instructions.yml*\n`;
        return [{
                path: path.join(this.basePath, 'CLAUDE.md'),
                type: 'file',
                size: content.length,
                preview: content.slice(0, 300) + (content.length > 300 ? '...' : '')
            }];
    }
    previewCopilotConfig(instructions) {
        let content = `# GitHub Copilot Instructions\n\n`;
        content += `Project-specific instructions for GitHub Copilot.\n\n`;
        for (const instruction of instructions) {
            if (!instruction)
                continue;
            content += `- **${instruction.name}**`;
            if (instruction.description) {
                content += `: ${instruction.description}`;
            }
            if (instruction.files) {
                content += ` (${instruction.files})`;
            }
            content += `\n`;
        }
        content += `\n---\n\n`;
        content += `*Generated by @company/rules-package from project-specific instructions.yml*\n`;
        return [{
                path: path.join(this.basePath, 'copilot-instructions.md'),
                type: 'file',
                size: content.length,
                preview: content.slice(0, 300) + (content.length > 300 ? '...' : '')
            }];
    }
    async previewGitignore(instructions) {
        const gitignorePath = path.join(this.basePath, '.gitignore');
        let gitignoreContent = '';
        // Read existing .gitignore if it exists
        if (fs.existsSync(gitignorePath)) {
            gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        }
        const newEntries = [];
        // Add cursor rules to gitignore if cursor is used
        if (instructions.ides.includes('cursor')) {
            if (!gitignoreContent.includes('cursor/rules/')) {
                newEntries.push('cursor/rules/');
            }
        }
        if (newEntries.length === 0) {
            return null;
        }
        let previewContent = gitignoreContent;
        if (previewContent && !previewContent.endsWith('\n')) {
            previewContent += '\n';
        }
        previewContent += '\n# Generated by @launchmetrics/rules-package\n';
        previewContent += '# WARNING: Do not manually add generated files to git - they should remain gitignored\n';
        previewContent += newEntries.join('\n') + '\n';
        return {
            path: path.join(this.basePath, '.gitignore'),
            type: 'file',
            size: previewContent.length,
            preview: previewContent.slice(-200)
        };
    }
}
exports.FileGenerator = FileGenerator;
//# sourceMappingURL=generator.js.map