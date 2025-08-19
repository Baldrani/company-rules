# @launchmetrics/rules-package

A private npm package for generating consistent IDE and AI agent configuration files across all company projects.

## Overview

This package helps standardize development environments by generating configuration files for various IDEs (Cursor, VSCode, PHPStorm) and AI coding assistants (Claude, GitHub Copilot) from a single YAML configuration file.

## Features

- 🎯 **Single Source of Truth** - Define rules once, apply everywhere
- 👁️ **Preview Mode** - See what files will be generated before creating them
- ✅ **Comprehensive Validation** - Catch configuration errors early
- 🔧 **Multiple IDE Support** - Cursor, VSCode, PHPStorm, WebStorm
- 🤖 **AI Agent Integration** - Claude, GitHub Copilot, Codeium
- 📁 **Smart File Management** - Automatic .gitignore updates

## Installation

```bash
npm install @launchmetrics/rules-package
```

## Quick Start

1. **Initialize configuration**:
   ```bash
   npx instructor init
   ```

2. **Preview what will be generated**:
   ```bash
   npx instructor preview --show-content
   ```

3. **Generate configuration files**:
   ```bash
   npx instructor install
   ```

## CLI Commands

### `instructor init`

Create a new `instructions.yml` configuration file.

```bash
# Create default configuration
npx instructor init

# Interactive setup with prompts
npx instructor init --interactive
```

### `instructor preview`

Preview what files would be generated without creating them.

```bash
# Basic preview
npx instructor preview

# Show file contents
npx instructor preview --show-content

# Use custom config file
npx instructor preview -c my-config.yml
```

### `instructor install`

Generate configuration files from instructions.yml.

```bash
# Use default config
npx instructor install

# Use custom config file
npx instructor install -c my-config.yml

# Show detailed output
npx instructor install --verbose
```

### `instructor validate`

Validate your configuration file.

```bash
npx instructor validate
npx instructor validate -c my-config.yml
```

### `instructor status`

Show current configuration status and generated files.

```bash
npx instructor status
```

### `instructor clean`

Remove all generated configuration files.

```bash
# With confirmation prompt
npx instructor clean

# Skip confirmation
npx instructor clean --confirm
```

## Configuration Reference

### Basic Structure

```yaml
ides:
  - cursor
  - vscode

agents:
  - claude
  - copilot

instructions:
  - name: use tabs instead of spaces
    files: "*.{ts,tsx,js,jsx}"
  - name: minimize use of ai generated comments
  - name: remove unused imports after changing a file
    files: "*.ts,*.tsx"
```

### Supported IDEs

| IDE | Configuration Generated |
|-----|------------------------|
| `cursor` | `cursor/rules/*.md` (gitignored) |
| `vscode` | `.vscode/settings.json` |
| `phpstorm` | `.idea/workspace.xml` (planned) |
| `webstorm` | `.idea/workspace.xml` (planned) |

### Supported Agents

| Agent | Configuration Generated |
|-------|------------------------|
| `claude` | `CLAUDE.md` |
| `copilot` | `copilot-instructions.md` |
| `codeium` | `codeium-instructions.md` (planned) |

### Instruction Formats

#### String Format
```yaml
instructions:
  - "use tabs instead of spaces"
  - "minimize comments"
```

#### Object Format
```yaml
instructions:
  - name: use tabs instead of spaces
    description: Always use tabs for indentation, never spaces
    files: "*.{ts,tsx,js,jsx}"
  
  - name: remove unused imports
    files: "*.ts,*.tsx"
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

### React/TypeScript Project

```yaml
ides:
  - cursor
  - vscode

agents:
  - claude
  - copilot

instructions:
  - name: use tabs for indentation
    files: "*.{ts,tsx,js,jsx}"
  
  - name: use Tailwind CSS for styling
    description: Prefer Tailwind utility classes over custom CSS
    files: "*.{tsx,jsx}"
  
  - name: remove unused imports
    files: "*.{ts,tsx}"
  
  - name: prefer React function components
    files: "*.{tsx,jsx}"
  
  - name: use TypeScript strict mode
    files: "*.ts"
  
  - name: minimize AI-generated comments
  
  - name: do not refactor existing components unless explicitly requested
```

### Node.js/Express Project

```yaml
ides:
  - vscode
  - cursor

agents:
  - claude

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
```

## Generated Files

### Cursor Rules
Each instruction becomes a separate markdown file in `cursor/rules/`:
- `01-use-tabs-instead-of-spaces.md`
- `02-minimize-comments.md`
- etc.

### VSCode Settings
Generates `.vscode/settings.json` with IDE-specific configuration.

### Claude Instructions
Creates `CLAUDE.md` with formatted instructions for Claude AI.

### GitHub Copilot Instructions
Creates `copilot-instructions.md` with bullet-pointed instructions.

## Validation

The package includes comprehensive validation that checks for:

### Errors (blocking)
- Invalid data types
- Empty required fields
- Malformed instruction objects
- Invalid file patterns

### Warnings (non-blocking)
- Unsupported IDEs/agents
- Duplicate entries
- Long instruction names
- Missing file patterns for type-specific rules
- Redundant glob patterns

## API Usage

```javascript
import { 
  InstructionParser, 
  FileGenerator, 
  CompanyRulesManager 
} from '@launchmetrics/rules-package';

// Parse configuration
const config = { /* your YAML config */ };
const parser = new InstructionParser(config);
const instructions = parser.parse();

// Generate files
const generator = new FileGenerator();
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
  ValidationResult,
  PreviewItem 
} from '@launchmetrics/rules-package';

const parser = new InstructionParser(config);
const validation: ValidationResult = parser.validate();
const instructions: ParsedInstructions = parser.parse();
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
node dist/src/cli.js init
node dist/src/cli.js preview
```

## Troubleshooting

### Common Issues

**Configuration validation fails**
- Check YAML syntax with `npx instructor validate`
- Ensure required fields are present
- Verify IDE/agent names are supported

**Generated files not appearing**
- Run `npx instructor status` to check configuration
- Ensure you have write permissions
- Check if files are being gitignored

**TypeScript compilation errors**
- Update to latest version: `npm update @launchmetrics/rules-package`
- Check TypeScript version compatibility

### Debug Mode

Set `DEBUG=instructor` environment variable for verbose output:

```bash
DEBUG=instructor npx instructor install
```

## License

UNLICENSED - Private package for Launchmetrics internal use.

## Changelog

### v1.0.0
- Initial release with Cursor, VSCode, Claude, and Copilot support
- Preview functionality
- Comprehensive validation
- TypeScript strict mode
- Interactive configuration setup