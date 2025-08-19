export interface IDEOption {
	value: string;
	name: string;
	description: string;
}

export interface AgentOption {
	value: string;
	name: string;
	description: string;
}

export const SUPPORTED_IDES: IDEOption[] = [
	{
		value: 'cursor',
		name: 'Cursor',
		description: 'AI-powered code editor with built-in copilot features'
	},
	{
		value: 'vscode',
		name: 'Visual Studio Code',
		description: 'Popular extensible code editor from Microsoft'
	},
	{
		value: 'webstorm',
		name: 'WebStorm',
		description: 'JetBrains IDE for JavaScript and web development'
	},
	{
		value: 'phpstorm',
		name: 'PhpStorm',
		description: 'JetBrains IDE for PHP development'
	},
	{
		value: 'intellij',
		name: 'IntelliJ IDEA',
		description: 'JetBrains IDE for Java and other JVM languages'
	},
	{
		value: 'pycharm',
		name: 'PyCharm',
		description: 'JetBrains IDE for Python development'
	},
	{
		value: 'sublime',
		name: 'Sublime Text',
		description: 'Fast and lightweight text editor'
	},
	{
		value: 'vim',
		name: 'Vim/Neovim',
		description: 'Highly configurable terminal-based editor'
	},
	{
		value: 'emacs',
		name: 'Emacs',
		description: 'Extensible text editor and computing environment'
	}
];

export const SUPPORTED_AGENTS: AgentOption[] = [
	{
		value: 'claude',
		name: 'Claude (Anthropic)',
		description: 'Advanced AI assistant for code review and development'
	},
	{
		value: 'copilot',
		name: 'GitHub Copilot',
		description: 'AI pair programmer from GitHub and OpenAI'
	},
	{
		value: 'codeium',
		name: 'Codeium',
		description: 'Free AI-powered code completion and chat'
	},
	{
		value: 'tabnine',
		name: 'Tabnine',
		description: 'AI-powered code completion for multiple languages'
	},
	{
		value: 'chatgpt',
		name: 'ChatGPT/OpenAI',
		description: 'OpenAI chatbot for code assistance and review'
	},
	{
		value: 'gemini',
		name: 'Google Gemini',
		description: 'Google\'s AI assistant for development tasks'
	},
	{
		value: 'sourcegraph',
		name: 'Sourcegraph Cody',
		description: 'AI coding assistant with codebase context'
	},
	{
		value: 'amazon-q',
		name: 'Amazon Q Developer',
		description: 'AWS-powered AI assistant for development'
	}
];

export const DEFAULT_SELECTED_IDES = ['cursor', 'vscode'];
export const DEFAULT_SELECTED_AGENTS = ['claude', 'copilot'];