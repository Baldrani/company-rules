import * as fs from 'fs';
import * as path from 'path';
import { Instruction } from './parser';
import { LLMService } from './llm-service';

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

export class FileGenerator {
  private llmService: LLMService | null;
  private basePath: string;

  constructor(basePath: string = './') {
    this.llmService = LLMService.fromEnvironment();
    this.basePath = basePath;
  }

  async generate(instructions: GeneratorInstructions): Promise<void> {
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

  async preview(instructions: GeneratorInstructions): Promise<PreviewItem[]> {
    const items: PreviewItem[] = [];

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

  private async generateIDEConfig(ide: string, instructions: Instruction[]): Promise<void> {
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

  private async generateAgentConfig(agent: string, instructions: Instruction[]): Promise<void> {
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

  private async previewIDEConfig(ide: string, instructions: Instruction[]): Promise<PreviewItem[]> {
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

  private async previewAgentConfig(agent: string, instructions: Instruction[]): Promise<PreviewItem[]> {
    switch (agent.toLowerCase()) {
      case 'claude':
        return this.previewClaudeConfig(instructions);
      case 'copilot':
        return this.previewCopilotConfig(instructions);
      default:
        return [];
    }
  }

  private async generateCursorRules(instructions: Instruction[]): Promise<void> {
    const cursorDir = path.join(this.basePath, 'cursor/rules');
    
    // Ensure cursor/rules directory exists
    fs.mkdirSync(cursorDir, { recursive: true });

    // Generate individual rule files
    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];
      if (!instruction) continue;
      
      const filename = `${String(i + 1).padStart(2, '0')}-${this.sanitizeFilename(instruction.name)}.md`;
      const filepath = path.join(cursorDir, filename);
      
      let content = `# ${instruction.name}\n\n`;
      
      if (this.llmService) {
        try {
          const expandedContent = await this.llmService.expandInstruction(instruction, 'cursor');
          content += expandedContent;
        } catch (error) {
          content += instruction.description || instruction.name;
        }
      } else {
        content += instruction.description || instruction.name;
      }
      
      if (instruction.files) {
        content += `\n\n**Applies to:** ${instruction.files}`;
      }

      fs.writeFileSync(filepath, content);
    }
  }

  private async generateVSCodeSettings(instructions: Instruction[]): Promise<void> {
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

  private async generateJetBrainsSettings(instructions: Instruction[], ide: string): Promise<void> {
    // Generate JetBrains IDE-specific configuration
    console.log(`${ide} configuration generation not implemented yet`);
  }

  private async generateSublimeSettings(instructions: Instruction[]): Promise<void> {
    // Generate Sublime Text-specific configuration
    console.log('Sublime Text configuration generation not implemented yet');
  }

  private async generateVimConfig(instructions: Instruction[]): Promise<void> {
    // Generate Vim/Neovim-specific configuration
    console.log('Vim/Neovim configuration generation not implemented yet');
  }

  private async generateEmacsConfig(instructions: Instruction[]): Promise<void> {
    // Generate Emacs-specific configuration
    console.log('Emacs configuration generation not implemented yet');
  }

  private async generateClaudeConfig(instructions: Instruction[]): Promise<void> {
    let content = `# Project Instructions for Claude\n\n`;
    content += `This file contains project-specific instructions for Claude AI assistant.\n\n`;
    content += `## Code Guidelines\n\n`;

    for (const instruction of instructions) {
      if (!instruction) continue;
      
      content += `### ${instruction.name}\n\n`;
      
      if (this.llmService) {
        try {
          const expandedContent = await this.llmService.expandInstruction(instruction, 'claude');
          content += expandedContent;
        } catch (error) {
          content += instruction.description || instruction.name;
        }
      } else {
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

  private async generateCopilotConfig(instructions: Instruction[]): Promise<void> {
    let content = `# GitHub Copilot Instructions\n\n`;
    content += `Project-specific instructions for GitHub Copilot.\n\n`;

    for (const instruction of instructions) {
      if (!instruction) continue;
      
      content += `## ${instruction.name}\n\n`;
      
      if (this.llmService) {
        try {
          const expandedContent = await this.llmService.expandInstruction(instruction, 'copilot');
          content += expandedContent;
        } catch (error) {
          content += instruction.description || instruction.name;
        }
      } else {
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

  private async generateCodeiumConfig(instructions: Instruction[]): Promise<void> {
    // Generate Codeium-specific configuration
    console.log('Codeium configuration generation not implemented yet');
  }

  private async generateTabnineConfig(instructions: Instruction[]): Promise<void> {
    // Generate Tabnine-specific configuration  
    console.log('Tabnine configuration generation not implemented yet');
  }

  private async generateChatGPTConfig(instructions: Instruction[]): Promise<void> {
    // Generate ChatGPT-specific configuration
    console.log('ChatGPT configuration generation not implemented yet');
  }

  private async generateGeminiConfig(instructions: Instruction[]): Promise<void> {
    // Generate Google Gemini-specific configuration
    console.log('Google Gemini configuration generation not implemented yet');
  }

  private async generateSourcegraphConfig(instructions: Instruction[]): Promise<void> {
    // Generate Sourcegraph Cody-specific configuration
    console.log('Sourcegraph Cody configuration generation not implemented yet');
  }

  private async generateAmazonQConfig(instructions: Instruction[]): Promise<void> {
    // Generate Amazon Q Developer-specific configuration
    console.log('Amazon Q Developer configuration generation not implemented yet');
  }

  private async updateGitignore(instructions: GeneratorInstructions): Promise<void> {
    const gitignorePath = path.join(this.basePath, '.gitignore');
    let gitignoreContent = '';

    // Read existing .gitignore if it exists
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const newEntries: string[] = [];

    // Add cursor rules to gitignore if cursor is used
    if (instructions.ides.includes('cursor')) {
      if (!gitignoreContent.includes('cursor/rules/')) {
        newEntries.push('cursor/rules/');
      }
    }

    // Add agent-specific files to gitignore
    if (instructions.agents.includes('claude')) {
      if (!gitignoreContent.includes('CLAUDE.md')) {
        newEntries.push('CLAUDE.md');
      }
    }

    if (instructions.agents.includes('copilot')) {
      if (!gitignoreContent.includes('copilot-instructions.md')) {
        newEntries.push('copilot-instructions.md');
      }
    }

    // Add other agent files when implemented
    const otherAgentFiles = [
      { agent: 'codeium', file: 'codeium-instructions.md' },
      { agent: 'tabnine', file: 'tabnine-instructions.md' },
      { agent: 'chatgpt', file: 'chatgpt-instructions.md' },
      { agent: 'gemini', file: 'gemini-instructions.md' },
      { agent: 'sourcegraph', file: 'sourcegraph-instructions.md' },
      { agent: 'amazon-q', file: 'amazon-q-instructions.md' }
    ];

    otherAgentFiles.forEach(({ agent, file }) => {
      if (instructions.agents.includes(agent)) {
        if (!gitignoreContent.includes(file)) {
          newEntries.push(file);
        }
      }
    });

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

  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
  }

  // Preview methods
  private previewCursorRules(instructions: Instruction[]): PreviewItem[] {
    const items: PreviewItem[] = [];
    
    // Directory entry
    items.push({
      path: path.join(this.basePath, 'cursor/rules/'),
      type: 'directory'
    });

    // Individual rule files
    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];
      if (!instruction) continue;
      
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

  private previewVSCodeSettings(instructions: Instruction[]): PreviewItem[] {
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

  private previewPhpStormSettings(instructions: Instruction[]): PreviewItem[] {
    return [{
      path: path.join(this.basePath, '.idea/workspace.xml'),
      type: 'file',
      preview: '<!-- PhpStorm configuration generation not implemented yet -->'
    }];
  }

  private previewClaudeConfig(instructions: Instruction[]): PreviewItem[] {
    let content = `# Project Instructions for Claude\n\n`;
    content += `This file contains project-specific instructions for Claude AI assistant.\n\n`;
    content += `## Code Guidelines\n\n`;

    for (const instruction of instructions) {
      if (!instruction) continue;
      
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

  private previewCopilotConfig(instructions: Instruction[]): PreviewItem[] {
    let content = `# GitHub Copilot Instructions\n\n`;
    content += `Project-specific instructions for GitHub Copilot.\n\n`;

    for (const instruction of instructions) {
      if (!instruction) continue;
      
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

  private async previewGitignore(instructions: GeneratorInstructions): Promise<PreviewItem | null> {
    const gitignorePath = path.join(this.basePath, '.gitignore');
    let gitignoreContent = '';

    // Read existing .gitignore if it exists
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const newEntries: string[] = [];

    // Add cursor rules to gitignore if cursor is used
    if (instructions.ides.includes('cursor')) {
      if (!gitignoreContent.includes('cursor/rules/')) {
        newEntries.push('cursor/rules/');
      }
    }

    // Add agent-specific files to gitignore
    if (instructions.agents.includes('claude')) {
      if (!gitignoreContent.includes('CLAUDE.md')) {
        newEntries.push('CLAUDE.md');
      }
    }

    if (instructions.agents.includes('copilot')) {
      if (!gitignoreContent.includes('copilot-instructions.md')) {
        newEntries.push('copilot-instructions.md');
      }
    }

    // Add other agent files when implemented
    const otherAgentFiles = [
      { agent: 'codeium', file: 'codeium-instructions.md' },
      { agent: 'tabnine', file: 'tabnine-instructions.md' },
      { agent: 'chatgpt', file: 'chatgpt-instructions.md' },
      { agent: 'gemini', file: 'gemini-instructions.md' },
      { agent: 'sourcegraph', file: 'sourcegraph-instructions.md' },
      { agent: 'amazon-q', file: 'amazon-q-instructions.md' }
    ];

    otherAgentFiles.forEach(({ agent, file }) => {
      if (instructions.agents.includes(agent)) {
        if (!gitignoreContent.includes(file)) {
          newEntries.push(file);
        }
      }
    });

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