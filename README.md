# @launchmetrics/rules-package

A private npm package for generating consistent IDE and AI agent configuration files across all company projects.

## Overview

This package helps standardize development environments by generating configuration files for various IDEs and AI coding assistants from a single rules reference file. The key innovation is that **coding rules are defined once** in `instructions.yml`, while **IDE and agent preferences are chosen at runtime**.

## Architecture

```
instructions.yml  →  Runtime Selection  →  Generated Files
   (rules only)         (IDEs + agents)        (combined)
```

- **📋 instructions.yml** - Contains only coding rules/standards (never modified)
- **🎯 Runtime selection** - Choose IDEs and agents each time you install
- **🔧 Generated files** - Combines your rules with chosen platforms

## Features

- 🎯 **Portable Rules** - Define coding standards once, use anywhere
- 🔄 **Runtime IDE/Agent Selection** - Choose platforms each time you install
- 🤖 **LLM Enhancement** - Optional AI-powered detailed rule generation
- 👁️ **Preview Mode** - See what files will be generated before creating them
- ✅ **Comprehensive Validation** - Catch configuration errors early
- 🏗️ **Multiple IDE Support** - Cursor, VSCode, JetBrains IDEs, Sublime, Vim, Emacs
- 🤖 **AI Agent Integration** - Claude, GitHub Copilot, Codeium, Tabnine, ChatGPT, Gemini, Sourcegraph Cody, Amazon Q
- 📁 **Smart File Management** - Automatic .gitignore updates
- 🛡️ **Protected Configuration** - instructions.yml never overwritten

## Installation

```bash
npm install @launchmetrics/rules-package
```

## Quick Start

1. **Initialize rules configuration**:
   ```bash
   npx instructor init --interactive
   ```

2. **Install with IDE/agent selection**:
   ```bash
   npx instructor install --interactive
   ```

3. **Preview what will be generated**:
   ```bash
   npx instructor preview --show-content
   ```

## LLM Enhancement

Enable AI-powered detailed rule generation that transforms basic rules into comprehensive guidelines with examples and best practices.

### **Interactive Setup (Recommended)**

The CLI will guide you through LLM setup:

```bash
npx instructor install --interactive

# The CLI will ask:
# ? Would you like to use AI-powered detailed rule generation? Yes
# ? Which AI provider would you like to use? OpenAI (ChatGPT)
# ? Would you like to enter your OpenAI API key now? Yes
# ? Enter your OpenAI API key: ****************** (secure input)
```

### **Environment Variables (Alternative)**

You can also pre-set environment variables:

```bash
# Using OpenAI/ChatGPT
export OPENAI_API_KEY="your_key_here"
export OPENAI_MODEL="gpt-4"  # optional

# Using Anthropic/Claude  
export ANTHROPIC_API_KEY="your_key_here"
export ANTHROPIC_MODEL="claude-3-haiku-20240307"  # optional

# Then run install
npx instructor install --interactive
```

### **What LLM Enhancement Does**

**Basic rule:** `use tailwind`

**LLM-enhanced output:**
```markdown
Use Tailwind CSS for all styling. Follow these guidelines:

- Use Tailwind utility classes instead of custom CSS
- Prefer semantic class combinations over arbitrary values
- Use responsive prefixes (sm:, md:, lg:, xl:) for responsive design
- Use state variants (hover:, focus:, active:) for interactive elements
- Group related classes logically (layout, spacing, colors, typography)
- Use Tailwind's color palette instead of custom hex values
```

## CLI Commands

### `instructor init`

Create a new `instructions.yml` rules file (contains only coding rules).

```bash
# Create default rules
npx instructor init

# Interactive setup with framework-specific rules
npx instructor init --interactive
```

### `instructor install`

Generate configuration files by combining rules from `instructions.yml` with your chosen IDEs and agents.

```bash
# Interactive mode - choose IDEs, agents, and rules
npx instructor install --interactive

# Non-interactive mode - uses default IDEs/agents (Cursor + VSCode, Claude + Copilot)
npx instructor install

# Use custom config file
npx instructor install -c my-rules.yml --interactive

# Show detailed output
npx instructor install --verbose
```

### `instructor preview`

Preview what files would be generated without creating them.

```bash
# Basic preview (uses default IDEs/agents)
npx instructor preview

# Show file contents preview
npx instructor preview --show-content

# Use custom config file
npx instructor preview -c my-rules.yml
```

### `instructor validate`

Validate your rules configuration file.

```bash
npx instructor validate
npx instructor validate -c my-rules.yml
```

### `instructor status`

Show current configuration status and existing generated files.

```bash
npx instructor status
```

### `instructor reset` / `instructor clean`

Remove all generated configuration files, directories, and .gitignore entries (preserves instructions.yml).

```bash
# With confirmation prompt (both commands work identically)
npx instructor reset
npx instructor clean

# Skip confirmation 
npx instructor reset --confirm
npx instructor clean --confirm
```

**What gets cleaned:**
- All generated instruction files (`CLAUDE.md`, `copilot-instructions.md`, etc.)
- Generated directories (`cursor/rules/`, `.vscode/` if empty)
- Generated .gitignore entries
- **Preserves:** `instructions.yml` (your rules are always safe)

## Configuration Reference

### Rules File Structure

**instructions.yml** contains ONLY coding rules (no IDE/agent configuration):

```yaml
instructions:
  - name: use tabs instead of spaces
    description: use tabs for indentation to ensure consistent formatting across editors
    files: "*.{ts,tsx,js,jsx,py,go,rust}"
  
  - name: use tailwind for styling
    description: prefer tailwind utility classes over custom css for consistent design system
    files: "*.{tsx,jsx,vue,html}"
  
  - name: minimize use of ai generated comments
    description: write self-documenting code instead of explaining obvious logic in comments
  
  - name: never change assertions to make tests pass
    description: if a test is failing, fix the code or update the test logic, never just change assertions
    files: "*.test.*,*.spec.*"
```

### Supported IDEs

| IDE | Value | Generated Files |
|-----|-------|----------------|
| Cursor | `cursor` | `cursor/rules/*.md` (gitignored) |
| Visual Studio Code | `vscode` | `.vscode/settings.json` |
| WebStorm | `webstorm` | *Not implemented yet* |
| PhpStorm | `phpstorm` | *Not implemented yet* |
| IntelliJ IDEA | `intellij` | *Not implemented yet* |
| PyCharm | `pycharm` | *Not implemented yet* |
| Sublime Text | `sublime` | *Not implemented yet* |
| Vim/Neovim | `vim` | *Not implemented yet* |
| Emacs | `emacs` | *Not implemented yet* |

### Supported AI Agents

| Agent | Value | Generated Files |
|-------|--------|----------------|
| Claude (Anthropic) | `claude` | `CLAUDE.md` |
| GitHub Copilot | `copilot` | `copilot-instructions.md` |
| Codeium | `codeium` | *Not implemented yet* |
| Tabnine | `tabnine` | *Not implemented yet* |
| ChatGPT/OpenAI | `chatgpt` | *Not implemented yet* |
| Google Gemini | `gemini` | *Not implemented yet* |
| Sourcegraph Cody | `sourcegraph` | *Not implemented yet* |
| Amazon Q Developer | `amazon-q` | *Not implemented yet* |

### Instruction Formats

#### String Format (Simple)
```yaml
instructions:
  - "use tabs instead of spaces"
  - "minimize comments"
```

#### Object Format (Detailed)
```yaml
instructions:
  - name: use tabs instead of spaces
    description: Always use tabs for indentation, never spaces
    files: "*.{ts,tsx,js,jsx}"
  
  - name: remove unused imports
    description: clean up imports that are no longer needed to keep dependencies minimal
    files: "*.{ts,tsx,js,jsx,py}"
```

### File Pattern Examples

```yaml
files: "*.ts"              # TypeScript files
files: "*.{ts,tsx}"        # TypeScript and TSX files
files: "src/**/*.js"       # JavaScript files in src/
files: "**/*.test.js"      # All test files
files: "*.{py,pyx}"        # Python files
```

## Examples

Check out the comprehensive example in `examples/instructions.yml` with 20+ real-world coding rules covering:

- **Code formatting & style** (tabs, Tailwind, naming)
- **Code quality & practices** (comments, composition, error handling)
- **Testing standards** (no assertion changes, edge cases, descriptive names)
- **Code organization** (no unnecessary refactoring, clean imports)
- **Security & best practices** (no secrets, input validation, strict typing)
- **Performance guidelines** (readability first, lazy loading)
- **Database & API rules** (prepared statements, error handling)
- **Documentation standards** (API docs, README maintenance)

### Quick Example Setup

```bash
# Copy comprehensive example
cp examples/instructions.yml ./instructions.yml

# Customize for your team, then install interactively
npx instructor install --interactive
```

### React/TypeScript Project Example

```yaml
instructions:
  - name: use tabs for indentation
    files: "*.{ts,tsx,js,jsx}"
  
  - name: use Tailwind CSS for styling
    description: Prefer Tailwind utility classes over custom CSS
    files: "*.{tsx,jsx}"
  
  - name: remove unused imports after changing a file
    files: "*.{ts,tsx}"
  
  - name: prefer React function components
    files: "*.{tsx,jsx}"
  
  - name: use TypeScript strict mode
    files: "*.ts"
  
  - name: minimize AI-generated comments
  
  - name: do not refactor existing components unless explicitly requested
```

### Node.js/Express Project Example

```yaml
instructions:
  - name: use 2 spaces for indentation
    files: "*.js"
  
  - name: prefer async/await over promises
    files: "*.js"
  
  - name: use ESLint and Prettier
    files: "*.{js,json}"
  
  - name: write comprehensive tests
    files: "*.test.js"
  
  - name: use environment variables for configuration
    files: "*.js"
  
  - name: handle errors explicitly
    description: always handle potential errors rather than ignoring them or using silent failures
    files: "*.js"
```

## Generated Files

The generated files are created in the same directory as your `instructions.yml` file.

### With LLM Enhancement
When you enable LLM enhancement (either through interactive setup or environment variables), basic rules are expanded into detailed, actionable guidelines tailored for each IDE and agent.

### Without LLM Enhancement
Basic descriptions from your `instructions.yml` are used as-is, providing simple but effective rule documentation.

### File Structure
```
your-project/
├── instructions.yml          # Your rules (never modified)
├── CLAUDE.md                 # Claude instructions
├── copilot-instructions.md   # Copilot instructions  
├── cursor/rules/             # Cursor individual rule files
├── .vscode/settings.json     # VSCode settings
└── .gitignore               # Updated automatically
```

## Validation

The package includes comprehensive validation:

### Errors (blocking)
- Invalid YAML syntax
- Missing instruction names
- Invalid data types
- Malformed instruction objects

### Warnings (non-blocking)
- Long instruction names
- Missing file patterns for specific rules
- Redundant glob patterns
- Unknown configuration keys

## Workflow

The typical workflow separates **rule definition** from **platform selection**:

```bash
# 1. Team creates shared rules (once)
npx instructor init --interactive
git add instructions.yml && git commit -m "Add team coding rules"

# 2. Each developer chooses their tools (repeatedly)
git clone project && cd project
npx instructor install --interactive  # Choose your IDEs/agents
# (instructions.yml stays unchanged)

# 3. Update rules as team standards evolve
# Edit instructions.yml, commit changes
npx instructor install --interactive  # Regenerate with new rules
```

## API Usage

```javascript
import { 
  InstructionParser, 
  FileGenerator,
  GeneratorInstructions
} from '@launchmetrics/rules-package';

// Parse rules file
const config = { /* your YAML config */ };
const parser = new InstructionParser(config);
const parsedInstructions = parser.parse();

// Combine with runtime IDE/agent choices
const instructions: GeneratorInstructions = {
  ides: ['cursor', 'vscode'],
  agents: ['claude', 'copilot'], 
  instructions: parsedInstructions.instructions
};

// Generate files
const generator = new FileGenerator('./path/to/output');
await generator.generate(instructions);

// Or preview first
const preview = await generator.preview(instructions);
console.log('Would generate:', preview);
```

## TypeScript Support

Full TypeScript support with strict mode enabled:

```typescript
import { 
  Instruction, 
  ParsedInstructions, 
  GeneratorInstructions,
  ValidationResult,
  PreviewItem 
} from '@launchmetrics/rules-package';

const parser = new InstructionParser(config);
const validation: ValidationResult = parser.validate();
const parsedInstructions: ParsedInstructions = parser.parse();
```

## Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`
5. Lint code: `npm run lint`

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Test CLI locally
node dist/src/cli.js init --interactive
node dist/src/cli.js install --interactive
node dist/src/cli.js preview --show-content
```

## Troubleshooting

### Common Issues

**Configuration validation fails**
- Check YAML syntax with `npx instructor validate`
- Ensure instruction names are present
- Verify file patterns are valid

**No IDE/agent selection prompt**
- Use `--interactive` flag: `npx instructor install --interactive`
- Check that instructions.yml contains only instructions, not ides/agents

**Generated files not appearing**
- Run `npx instructor status` to check configuration
- Ensure you have write permissions in the target directory
- Check that the instructions.yml file exists and is valid

**LLM enhancement not working**
- Use interactive mode: `npx instructor install --interactive` (recommended)
- Verify API key is set: `echo $OPENAI_API_KEY` or `echo $ANTHROPIC_API_KEY`
- Check API key format (OpenAI: starts with `sk-`, Anthropic: starts with `sk-ant-`)
- Verify API key has sufficient credits/permissions
- Review error messages in verbose mode: `npx instructor install --interactive --verbose`

### Debug Mode

Set `DEBUG=instructor` environment variable for verbose output:

```bash
DEBUG=instructor npx instructor install --interactive
```

## Security

- **Protected configuration**: `instructions.yml` is never modified by CLI commands
- **Safe cleanup**: `reset`/`clean` commands preserve your rules file and clean up completely
- **Secure API key entry**: Interactive mode uses masked password input
- **Session-only keys**: API keys entered interactively are only stored for current session
- **LLM privacy**: API calls only send rule names/descriptions, never your actual code
- **No secrets in output**: Generated files contain only coding guidelines
- **Complete .gitignore management**: All generated files automatically added/removed from .gitignore

## License

UNLICENSED - Private package for Launchmetrics internal use.

## Changelog

### v1.2.0 - Complete Architecture Overhaul
**Major architectural changes and comprehensive feature additions**

#### 🔧 **Core Architecture Changes**
- **BREAKING**: Complete separation of concerns - `instructions.yml` now contains ONLY coding rules
- **BREAKING**: IDE and agent selection moved to runtime (no longer stored in config)
- **BREAKING**: Instructions.yml file is now completely protected from modification
- Redesigned CLI flow to prompt for IDE/agent selection on every install

#### 🤖 **LLM Integration & Enhancement**
- Added full OpenAI API integration for rule enhancement
- Added Anthropic (Claude) API integration for rule enhancement
- Interactive LLM provider selection (OpenAI vs Anthropic)
- Secure API key prompting with masked password input
- Session-based API key storage (not persisted)
- API key validation with provider-specific format checks
- Fallback to basic rule generation when LLM unavailable
- Enhanced rule expansion with platform-specific prompts

#### 💡 **Interactive Experience**
- New `--interactive` flag for all commands requiring user choices
- Comprehensive selection prompts for IDEs, agents, and rules
- Real-time API key setup during installation
- Enhanced user experience with colored output and progress indicators
- Smart defaults when not using interactive mode

#### 📁 **File Management & Cleanup**
- Comprehensive .gitignore management (automatic add/remove)
- Complete cleanup system that removes files, directories, and gitignore entries
- Protected instructions.yml from all modification operations
- Smart directory cleanup (removes empty parent directories)
- Enhanced `clean`/`reset` commands with confirmation prompts

#### 🎯 **Expanded Platform Support**
- **IDEs**: 9 supported (Cursor, VSCode, WebStorm, PhpStorm, IntelliJ, PyCharm, Sublime, Vim, Emacs)
- **AI Agents**: 8 supported (Claude, Copilot, Codeium, Tabnine, ChatGPT, Gemini, Sourcegraph Cody, Amazon Q)
- Dynamic file generation based on selected platforms
- Platform-specific rule formatting and optimization

#### 🛡️ **Security & Validation**
- Secure API key input with masked characters
- Session-only API key storage (never persisted to disk)
- Enhanced validation with better error messages
- Complete protection of source configuration files

#### 📋 **Examples & Documentation**
- Added comprehensive `examples/instructions.yml` with 20+ real-world rules
- Updated all documentation to reflect new architecture
- Enhanced CLI help and command descriptions
- Improved error messages and user guidance

#### 🔄 **Developer Experience**
- Enhanced preview functionality showing exact file contents
- Better status reporting with detailed configuration info
- Improved validation with warnings and errors separation
- Enhanced debugging with verbose mode support

### v1.1.0 - Foundation Features
- **BREAKING**: Separated rules from IDE/agent selection
- Added LLM-powered rule enhancement (OpenAI/Anthropic) 
- Expanded IDE support (9 IDEs) and agent support (8 agents)
- Added `--interactive` mode for runtime selection
- Protected instructions.yml from modification
- Added comprehensive example with 20+ rules

### v1.0.0 - Initial Release
- Initial release with Cursor, VSCode, Claude, and Copilot support
- Preview functionality  
- Comprehensive validation
- TypeScript strict mode
- Interactive configuration setup