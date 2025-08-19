import * as fs from 'fs';
import * as path from 'path';
import { ParsedInstructions, Instruction } from './parser';

export interface PreviewItem {
  path: string;
  type: 'file' | 'directory';
  size?: number;
  preview?: string;
}

export class FileGenerator {
  async generate(instructions: ParsedInstructions): Promise<void> {
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

  async preview(instructions: ParsedInstructions): Promise<PreviewItem[]> {
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
        await this.generatePhpStormSettings(instructions);
        break;
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
    const cursorDir = './cursor/rules';
    
    // Ensure cursor/rules directory exists
    fs.mkdirSync(cursorDir, { recursive: true });

    // Generate individual rule files
    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];
      if (!instruction) continue;
      
      const filename = `${String(i + 1).padStart(2, '0')}-${this.sanitizeFilename(instruction.name)}.md`;
      const filepath = path.join(cursorDir, filename);
      
      let content = `# ${instruction.name}\n\n`;
      
      if (instruction.description) {
        content += `${instruction.description}\n\n`;
      } else {
        content += `${instruction.name}\n\n`;
      }
      
      if (instruction.files) {
        content += `**Applies to:** ${instruction.files}\n`;
      }

      fs.writeFileSync(filepath, content);
    }
  }

  private async generateVSCodeSettings(instructions: Instruction[]): Promise<void> {
    const vscodeDir = './.vscode';
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

  private async generatePhpStormSettings(instructions: Instruction[]): Promise<void> {
    // Generate PhpStorm-specific configuration
    console.log('PhpStorm configuration generation not implemented yet');
  }

  private async generateClaudeConfig(instructions: Instruction[]): Promise<void> {
    let content = `# Project Instructions for Claude\n\n`;
    content += `This file contains project-specific instructions for Claude AI assistant.\n\n`;
    content += `## Code Guidelines\n\n`;

    for (const instruction of instructions) {
      if (!instruction) continue;
      
      content += `### ${instruction.name}\n\n`;
      
      if (instruction.description) {
        content += `${instruction.description}\n\n`;
      } else {
        content += `${instruction.name}\n\n`;
      }
      
      if (instruction.files) {
        content += `**Files:** ${instruction.files}\n\n`;
      }
    }

    content += `\n---\n\n`;
    content += `*Generated by @company/rules-package from project-specific instructions.yml*\n`;

    fs.writeFileSync('./CLAUDE.md', content);
  }

  private async generateCopilotConfig(instructions: Instruction[]): Promise<void> {
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

    fs.writeFileSync('./copilot-instructions.md', content);
  }

  private async updateGitignore(instructions: ParsedInstructions): Promise<void> {
    const gitignorePath = './.gitignore';
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

    // Add the new entries to .gitignore
    if (newEntries.length > 0) {
      if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
        gitignoreContent += '\n';
      }
      
      gitignoreContent += '\n# Generated by @company/rules-package\n';
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
      path: 'cursor/rules/',
      type: 'directory'
    });

    // Individual rule files
    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i];
      if (!instruction) continue;
      
      const filename = `${String(i + 1).padStart(2, '0')}-${this.sanitizeFilename(instruction.name)}.md`;
      const filepath = `cursor/rules/${filename}`;
      
      let content = `# ${instruction.name}\n\n`;
      if (instruction.description) {
        content += `${instruction.description}\n\n`;
      } else {
        content += `${instruction.name}\n\n`;
      }
      if (instruction.files) {
        content += `**Applies to:** ${instruction.files}\n`;
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
      path: '.vscode/settings.json',
      type: 'file',
      size: content.length,
      preview: content.slice(0, 200) + (content.length > 200 ? '...' : '')
    }];
  }

  private previewPhpStormSettings(instructions: Instruction[]): PreviewItem[] {
    return [{
      path: '.idea/workspace.xml',
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
      if (instruction.description) {
        content += `${instruction.description}\n\n`;
      } else {
        content += `${instruction.name}\n\n`;
      }
      if (instruction.files) {
        content += `**Files:** ${instruction.files}\n\n`;
      }
    }

    content += `\n---\n\n`;
    content += `*Generated by @company/rules-package from project-specific instructions.yml*\n`;

    return [{
      path: 'CLAUDE.md',
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
      path: 'copilot-instructions.md',
      type: 'file',
      size: content.length,
      preview: content.slice(0, 300) + (content.length > 300 ? '...' : '')
    }];
  }

  private async previewGitignore(instructions: ParsedInstructions): Promise<PreviewItem | null> {
    const gitignorePath = './.gitignore';
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

    if (newEntries.length === 0) {
      return null;
    }

    let previewContent = gitignoreContent;
    if (previewContent && !previewContent.endsWith('\n')) {
      previewContent += '\n';
    }
    previewContent += '\n# Generated by @company/rules-package\n';
    previewContent += newEntries.join('\n') + '\n';

    return {
      path: '.gitignore',
      type: 'file',
      size: previewContent.length,
      preview: previewContent.slice(-200)
    };
  }
}