import { Instruction } from './parser';

export interface LLMConfig {
	provider: 'openai' | 'anthropic';
	apiKey: string;
	model?: string;
}

export class LLMService {
	private config: LLMConfig;

	constructor(config: LLMConfig) {
		this.config = config;
	}

	async expandInstruction(instruction: Instruction, targetPlatform: 'cursor' | 'vscode' | 'claude' | 'copilot'): Promise<string> {
		const prompt = this.buildPrompt(instruction, targetPlatform);
		
		try {
			const response = await this.callLLM(prompt);
			return response;
		} catch (error) {
			console.warn(`Failed to expand instruction "${instruction.name}" via LLM, using fallback`);
			return this.getFallbackContent(instruction);
		}
	}

	private buildPrompt(instruction: Instruction, targetPlatform: string): string {
		const platformContext = this.getPlatformContext(targetPlatform);
		
		return `You are an expert software development consultant. I need you to expand a basic coding rule into detailed, actionable instructions.

**Rule to expand:**
- Name: ${instruction.name}
- Description: ${instruction.description || 'None provided'}
- Applies to files: ${instruction.files || 'All files'}

**Target platform:** ${targetPlatform}
${platformContext}

**Requirements:**
1. Create detailed, actionable guidelines that developers can follow
2. Include specific examples where helpful
3. Explain the "why" behind the rule, not just the "what"
4. Make it practical and implementable
5. Keep it concise but thorough (2-8 bullet points)
6. Focus on the specific platform context

**Output format:** Plain text with bullet points, no markdown headers. Start directly with the expanded guidelines.`;
	}

	private getPlatformContext(platform: string): string {
		switch (platform) {
			case 'cursor':
				return `
**Platform context:** This will be used in Cursor IDE as .cursorrules files. These files help guide Cursor's AI assistant when suggesting code changes, refactoring, or generating new code. Focus on practical guidelines that an AI coding assistant should follow.`;
			
			case 'vscode':
				return `
**Platform context:** This will be used in VS Code settings and workspace configuration. Focus on editor settings, extensions, and automated tooling that can enforce or support this rule.`;
			
			case 'claude':
				return `
**Platform context:** This will be included in CLAUDE.md file for Claude AI assistant. Focus on clear instructions that help Claude understand project conventions and coding standards when assisting with development tasks.`;
			
			case 'copilot':
				return `
**Platform context:** This will be used in GitHub Copilot configuration. Focus on guidelines that help Copilot generate code that follows project conventions and best practices.`;
			
			default:
				return '';
		}
	}

	private async callLLM(prompt: string): Promise<string> {
		if (this.config.provider === 'openai') {
			return this.callOpenAI(prompt);
		} else if (this.config.provider === 'anthropic') {
			return this.callAnthropic(prompt);
		}
		throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
	}

	private async callOpenAI(prompt: string): Promise<string> {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.config.apiKey}`
			},
			body: JSON.stringify({
				model: this.config.model || 'gpt-3.5-turbo',
				messages: [
					{
						role: 'user',
						content: prompt
					}
				],
				max_tokens: 500,
				temperature: 0.3
			})
		});

		if (!response.ok) {
			throw new Error(`OpenAI API error: ${response.statusText}`);
		}

		const data = await response.json() as any;
		return data.choices[0]?.message?.content || '';
	}

	private async callAnthropic(prompt: string): Promise<string> {
		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.config.apiKey}`,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: this.config.model || 'claude-3-haiku-20240307',
				max_tokens: 500,
				messages: [
					{
						role: 'user',
						content: prompt
					}
				]
			})
		});

		if (!response.ok) {
			throw new Error(`Anthropic API error: ${response.statusText}`);
		}

		const data = await response.json() as any;
		return data.content[0]?.text || '';
	}

	private getFallbackContent(instruction: Instruction): string {
		const content = instruction.description || instruction.name;
		return `${content}

**Implementation guidelines:**
- Apply this rule consistently across the codebase
- Consider this rule when writing new code
- Review existing code to ensure compliance when making changes
- Use linting or formatting tools to enforce this rule automatically when possible`;
	}

	static fromEnvironment(): LLMService | null {
		const openaiKey = process.env.OPENAI_API_KEY;
		const anthropicKey = process.env.ANTHROPIC_API_KEY;

		if (openaiKey) {
			const config: LLMConfig = {
				provider: 'openai',
				apiKey: openaiKey
			};
			if (process.env.OPENAI_MODEL) {
				config.model = process.env.OPENAI_MODEL;
			}
			return new LLMService(config);
		}

		if (anthropicKey) {
			const config: LLMConfig = {
				provider: 'anthropic',
				apiKey: anthropicKey
			};
			if (process.env.ANTHROPIC_MODEL) {
				config.model = process.env.ANTHROPIC_MODEL;
			}
			return new LLMService(config);
		}

		return null;
	}
}