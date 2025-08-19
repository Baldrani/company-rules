#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const ora_1 = __importDefault(require("ora"));
const boxen_1 = __importDefault(require("boxen"));
const parser_1 = require("./parser");
const generator_1 = require("./generator");
const llm_service_1 = require("./llm-service");
const program = new commander_1.Command();
program
    .name('instructor')
    .description('CLI tool for generating IDE and agent configuration files')
    .version('1.0.0');
program
    .command('install')
    .description('Generate configuration files from instructions.yml')
    .option('-c, --config <path>', 'Path to instructions.yml file', './instructions.yml')
    .option('--verbose', 'Show detailed output')
    .option('--interactive', 'Choose which IDEs, agents, and instructions to use')
    .action(async (options) => {
    try {
        const configPath = path.resolve(options.config);
        console.log((0, boxen_1.default)(chalk_1.default.bold.blue('🚀 Company Rules Package Installer'), {
            padding: 1,
            borderColor: 'blue',
            borderStyle: 'round',
            margin: 1
        }));
        // Check if config file exists
        const spinner = (0, ora_1.default)('Checking configuration file...').start();
        if (!fs.existsSync(configPath)) {
            spinner.fail(chalk_1.default.red(`Configuration file not found: ${configPath}`));
            console.log(chalk_1.default.cyan('💡 To create a configuration file, run:'));
            console.log(chalk_1.default.white.bold('   npx instructor init'));
            process.exit(1);
        }
        spinner.succeed(chalk_1.default.green(`Found configuration: ${path.basename(configPath)}`));
        // Parse configuration
        const parseSpinner = (0, ora_1.default)('Parsing configuration...').start();
        const yamlContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.parse(yamlContent);
        const parser = new parser_1.InstructionParser(config);
        let instructions = parser.parse();
        parseSpinner.succeed(chalk_1.default.green(`Parsed ${instructions.instructions.length} instructions for ${instructions.ides.length} IDEs and ${instructions.agents.length} agents`));
        if (options.verbose) {
            console.log(chalk_1.default.gray('IDEs:'), instructions.ides.join(', '));
            console.log(chalk_1.default.gray('Agents:'), instructions.agents.join(', '));
            console.log(chalk_1.default.gray('Instructions:'), instructions.instructions.map(i => i.name).join(', '));
        }
        // Interactive mode: let user choose what to actually use
        if (options.interactive) {
            console.log(chalk_1.default.cyan('\n🎯 Let\'s customize your installation:\n'));
            const choices = await inquirer_1.default.prompt([
                {
                    type: 'checkbox',
                    name: 'selectedIdes',
                    message: 'Which IDEs would you like to configure?',
                    choices: instructions.ides.map(ide => ({
                        name: ide.charAt(0).toUpperCase() + ide.slice(1),
                        value: ide,
                        checked: true
                    })),
                    when: instructions.ides.length > 0
                },
                {
                    type: 'checkbox',
                    name: 'selectedAgents',
                    message: 'Which AI agents would you like to configure?',
                    choices: instructions.agents.map(agent => ({
                        name: agent.charAt(0).toUpperCase() + agent.slice(1),
                        value: agent,
                        checked: true
                    })),
                    when: instructions.agents.length > 0
                },
                {
                    type: 'checkbox',
                    name: 'selectedInstructions',
                    message: 'Which instructions would you like to include?',
                    choices: instructions.instructions.map(instruction => ({
                        name: instruction.name,
                        value: instruction.name,
                        checked: true
                    })),
                    when: instructions.instructions.length > 0
                }
            ]);
            // Filter instructions based on user selection
            instructions = {
                ides: choices.selectedIdes || instructions.ides,
                agents: choices.selectedAgents || instructions.agents,
                instructions: instructions.instructions.filter(instruction => choices.selectedInstructions?.includes(instruction.name) ?? true)
            };
            console.log(chalk_1.default.green(`\n✅ Selected: ${instructions.ides.length} IDEs, ${instructions.agents.length} agents, ${instructions.instructions.length} instructions\n`));
        }
        // Check LLM availability
        const llmService = llm_service_1.LLMService.fromEnvironment();
        if (llmService) {
            console.log(chalk_1.default.green('🤖 LLM service detected - will generate rich, detailed instructions'));
        }
        else {
            console.log(chalk_1.default.yellow('⚠️  No LLM API key found - using basic instructions'));
            console.log(chalk_1.default.gray('   Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable for enhanced rule generation'));
        }
        // Generate files
        const genSpinner = (0, ora_1.default)('Generating configuration files...').start();
        const generator = new generator_1.FileGenerator();
        await generator.generate(instructions);
        genSpinner.succeed(chalk_1.default.green('Configuration files generated successfully!'));
        // Show generated files
        console.log(chalk_1.default.bold.green('\n📝 Generated files:'));
        const generatedFiles = [];
        if (instructions.ides.includes('cursor')) {
            generatedFiles.push('cursor/rules/* (gitignored)');
        }
        if (instructions.ides.includes('vscode')) {
            generatedFiles.push('.vscode/settings.json');
        }
        if (instructions.agents.includes('claude')) {
            generatedFiles.push('CLAUDE.md');
        }
        if (instructions.agents.includes('copilot')) {
            generatedFiles.push('copilot-instructions.md');
        }
        generatedFiles.forEach(file => {
            console.log(chalk_1.default.gray('   ✓'), chalk_1.default.white(file));
        });
        console.log((0, boxen_1.default)(chalk_1.default.green.bold('🎉 Setup complete!') + '\n\n' +
            'Your development environment is now configured with consistent rules.\n' +
            chalk_1.default.gray('Run ') + chalk_1.default.cyan.bold('instructor status') + chalk_1.default.gray(' to see the current configuration.'), {
            padding: 1,
            borderColor: 'green',
            borderStyle: 'round',
            margin: 1
        }));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error generating configuration files:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
program
    .command('init')
    .description('Create a sample instructions.yml file')
    .option('--interactive', 'Interactive setup with prompts')
    .action(async (options) => {
    console.log((0, boxen_1.default)(chalk_1.default.bold.magenta('🎯 Initialize Company Rules'), {
        padding: 1,
        borderColor: 'magenta',
        borderStyle: 'round',
        margin: 1
    }));
    if (fs.existsSync('./instructions.yml')) {
        const { overwrite } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: 'instructions.yml already exists. Overwrite it?',
                default: false
            }
        ]);
        if (!overwrite) {
            console.log(chalk_1.default.yellow('📝 Edit the existing file to customize your project rules'));
            console.log(chalk_1.default.gray('💡 Or check out'), chalk_1.default.cyan('examples/instructions.yml'), chalk_1.default.gray('for inspiration'));
            console.log(chalk_1.default.cyan('🚀 Then run:'), chalk_1.default.white.bold('npx instructor install --interactive'));
            return;
        }
    }
    let config;
    if (options.interactive) {
        // Interactive setup
        const answers = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'ides',
                message: 'Which IDEs do you use?',
                choices: [
                    { name: 'Cursor', value: 'cursor' },
                    { name: 'VSCode', value: 'vscode' },
                    { name: 'PHPStorm', value: 'phpstorm' },
                    { name: 'WebStorm', value: 'webstorm' }
                ],
                default: ['cursor', 'vscode']
            },
            {
                type: 'checkbox',
                name: 'agents',
                message: 'Which AI coding assistants do you use?',
                choices: [
                    { name: 'Claude (Anthropic)', value: 'claude' },
                    { name: 'GitHub Copilot', value: 'copilot' },
                    { name: 'Codeium', value: 'codeium' }
                ],
                default: ['claude', 'copilot']
            },
            {
                type: 'checkbox',
                name: 'frameworks',
                message: 'What frameworks/technologies does your project use?',
                choices: [
                    { name: 'React/TypeScript', value: 'react-ts' },
                    { name: 'Vue.js', value: 'vue' },
                    { name: 'Node.js/Express', value: 'node' },
                    { name: 'Python/Django', value: 'django' },
                    { name: 'Tailwind CSS', value: 'tailwind' }
                ]
            },
            {
                type: 'input',
                name: 'customRules',
                message: 'Any custom rules? (comma-separated)',
                default: ''
            }
        ]);
        // Build config based on answers
        config = {
            ides: answers.ides,
            agents: answers.agents,
            instructions: []
        };
        // Add framework-specific rules
        if (answers.frameworks.includes('react-ts')) {
            config.instructions.push({ name: 'use tabs instead of spaces', files: '*.{ts,tsx,js,jsx}' }, { name: 'remove unused imports after changing a file', files: '*.ts,*.tsx' });
        }
        if (answers.frameworks.includes('tailwind')) {
            config.instructions.push({ name: 'use tailwind for styling' });
        }
        // Add common rules
        config.instructions.push({ name: 'minimize use of ai generated comments' }, { name: 'do not refactor existing components unless explicitly requested' }, { name: 'never change assertions to make tests pass', description: 'if a test is failing, update the test to match the expected', files: '*.test' });
        // Add custom rules
        if (answers.customRules.trim()) {
            const customRules = answers.customRules.split(',').map((rule) => rule.trim());
            customRules.forEach((rule) => {
                if (rule)
                    config.instructions.push({ name: rule });
            });
        }
    }
    else {
        // Default configuration
        config = {
            ides: ['cursor', 'vscode'],
            agents: ['copilot', 'claude'],
            instructions: [
                { name: 'use tabs instead of spaces', files: '*.{ts,tsx,js,jsx}' },
                { name: 'minimize use of ai generated comments' },
                { name: 'use tailwind for styling' },
                { name: 'do not refactor existing components unless explicitly requested' },
                { name: 'remove unused imports after changing a file', files: '*.ts,*.tsx' },
                { name: 'never change assertions to make tests pass', description: 'if a test is failing, update the test to match the expected', files: '*.test' }
            ]
        };
    }
    const yamlContent = yaml.stringify(config, { indent: 2 });
    fs.writeFileSync('./instructions.yml', yamlContent);
    console.log(chalk_1.default.green.bold('\n✅ Created instructions.yml'));
    console.log(chalk_1.default.gray('📁 Location:'), path.resolve('./instructions.yml'));
    console.log(chalk_1.default.gray('🎯 Configured for:'), config.ides.length > 0 ? config.ides.join(', ') : 'no IDEs', 'and', config.agents.length > 0 ? config.agents.join(', ') : 'no agents');
    console.log((0, boxen_1.default)(chalk_1.default.green('Next steps:') + '\n\n' +
        chalk_1.default.gray('1. Review and customize ') + chalk_1.default.cyan('instructions.yml') + '\n' +
        chalk_1.default.gray('   💡 Check ') + chalk_1.default.cyan('examples/instructions.yml') + chalk_1.default.gray(' for more rule ideas') + '\n' +
        chalk_1.default.gray('2. Run ') + chalk_1.default.cyan.bold('instructor install --interactive') + chalk_1.default.gray(' to choose IDEs/agents') + '\n' +
        chalk_1.default.gray('3. Use ') + chalk_1.default.cyan.bold('instructor validate') + chalk_1.default.gray(' to check your setup'), {
        padding: 1,
        borderColor: 'green',
        borderStyle: 'round',
        margin: 1
    }));
});
// Status command
program
    .command('status')
    .description('Show current configuration status')
    .option('-c, --config <path>', 'Path to instructions.yml file', './instructions.yml')
    .action((options) => {
    console.log((0, boxen_1.default)(chalk_1.default.bold.cyan('📊 Configuration Status'), {
        padding: 1,
        borderColor: 'cyan',
        borderStyle: 'round',
        margin: 1
    }));
    const configPath = path.resolve(options.config);
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
        console.log(chalk_1.default.red('❌ No configuration file found'));
        console.log(chalk_1.default.gray('📁 Looking for:'), configPath);
        console.log(chalk_1.default.cyan('💡 Run'), chalk_1.default.white.bold('instructor init'), chalk_1.default.cyan('to create one'));
        return;
    }
    try {
        const yamlContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.parse(yamlContent);
        const parser = new parser_1.InstructionParser(config);
        const validation = parser.validate();
        const instructions = parser.parse();
        console.log(chalk_1.default.green('✅ Configuration file found'));
        console.log(chalk_1.default.gray('📁 Location:'), configPath);
        console.log('');
        // Show IDEs
        console.log(chalk_1.default.bold('🖥️  IDEs configured:'), instructions.ides.length > 0 ? instructions.ides.join(', ') : chalk_1.default.gray('none'));
        // Show agents
        console.log(chalk_1.default.bold('🤖 Agents configured:'), instructions.agents.length > 0 ? instructions.agents.join(', ') : chalk_1.default.gray('none'));
        // Show instructions count
        console.log(chalk_1.default.bold('📋 Instructions:'), `${instructions.instructions.length} rules defined`);
        // Show validation warnings
        if (validation.warnings.length > 0) {
            console.log('');
            console.log(chalk_1.default.yellow('⚠️  Warnings:'));
            validation.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow('   •'), warning);
            });
        }
        // Check generated files
        console.log('');
        console.log(chalk_1.default.bold('📄 Generated files:'));
        const files = [
            { name: 'CLAUDE.md', condition: instructions.agents.includes('claude') },
            { name: 'copilot-instructions.md', condition: instructions.agents.includes('copilot') },
            { name: '.vscode/settings.json', condition: instructions.ides.includes('vscode') },
            { name: 'cursor/rules/*', condition: instructions.ides.includes('cursor') }
        ];
        files.forEach(file => {
            if (file.condition) {
                const exists = file.name.includes('*') ? fs.existsSync('./cursor/rules') : fs.existsSync(file.name);
                console.log(exists ? chalk_1.default.green('   ✓') : chalk_1.default.red('   ✗'), file.name);
            }
        });
        if (files.some(file => file.condition && !fs.existsSync(file.name.replace('/*', '')))) {
            console.log('');
            console.log(chalk_1.default.cyan('💡 Run'), chalk_1.default.white.bold('instructor install'), chalk_1.default.cyan('to generate missing files'));
        }
    }
    catch (error) {
        console.log(chalk_1.default.red('❌ Error reading configuration:'), error instanceof Error ? error.message : error);
    }
});
// Validate command
program
    .command('validate')
    .description('Validate instructions.yml configuration')
    .option('-c, --config <path>', 'Path to instructions.yml file', './instructions.yml')
    .action((options) => {
    console.log((0, boxen_1.default)(chalk_1.default.bold.yellow('🔍 Configuration Validation'), {
        padding: 1,
        borderColor: 'yellow',
        borderStyle: 'round',
        margin: 1
    }));
    const configPath = path.resolve(options.config);
    if (!fs.existsSync(configPath)) {
        console.log(chalk_1.default.red('❌ Configuration file not found:'), configPath);
        console.log(chalk_1.default.cyan('💡 Run'), chalk_1.default.white.bold('instructor init'), chalk_1.default.cyan('to create one'));
        process.exit(1);
    }
    try {
        const yamlContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.parse(yamlContent);
        const parser = new parser_1.InstructionParser(config);
        const validation = parser.validate();
        if (validation.valid) {
            console.log(chalk_1.default.green.bold('✅ Configuration is valid!'));
            if (validation.warnings.length > 0) {
                console.log('');
                console.log(chalk_1.default.yellow('⚠️  Warnings:'));
                validation.warnings.forEach(warning => {
                    console.log(chalk_1.default.yellow('   •'), warning);
                });
            }
        }
        else {
            console.log(chalk_1.default.red.bold('❌ Configuration has errors:'));
            validation.errors.forEach(error => {
                console.log(chalk_1.default.red('   •'), error);
            });
            if (validation.warnings.length > 0) {
                console.log('');
                console.log(chalk_1.default.yellow('⚠️  Warnings:'));
                validation.warnings.forEach(warning => {
                    console.log(chalk_1.default.yellow('   •'), warning);
                });
            }
            process.exit(1);
        }
    }
    catch (error) {
        console.log(chalk_1.default.red('❌ Error validating configuration:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
// Clean command
program
    .command('clean')
    .description('Remove generated configuration files')
    .option('--confirm', 'Skip confirmation prompt')
    .action(async (options) => {
    console.log((0, boxen_1.default)(chalk_1.default.bold.red('🗑️  Clean Generated Files'), {
        padding: 1,
        borderColor: 'red',
        borderStyle: 'round',
        margin: 1
    }));
    const filesToClean = [
        'CLAUDE.md',
        'copilot-instructions.md',
        '.vscode/settings.json',
        'cursor/rules'
    ];
    const existingFiles = filesToClean.filter(file => fs.existsSync(file));
    if (existingFiles.length === 0) {
        console.log(chalk_1.default.yellow('ℹ️  No generated files found to clean'));
        return;
    }
    console.log('The following generated files will be removed:');
    existingFiles.forEach(file => {
        console.log(chalk_1.default.red('   ✗'), file);
    });
    let shouldClean = options.confirm;
    if (!shouldClean) {
        const { confirm } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to delete these files?',
                default: false
            }
        ]);
        shouldClean = confirm;
    }
    if (!shouldClean) {
        console.log(chalk_1.default.yellow('Operation cancelled'));
        return;
    }
    const spinner = (0, ora_1.default)('Cleaning generated files...').start();
    try {
        existingFiles.forEach(file => {
            if (fs.existsSync(file)) {
                if (fs.statSync(file).isDirectory()) {
                    fs.rmSync(file, { recursive: true, force: true });
                }
                else {
                    fs.unlinkSync(file);
                }
            }
        });
        spinner.succeed(chalk_1.default.green('Generated files cleaned successfully!'));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Error cleaning files:') + ' ' + (error instanceof Error ? error.message : error));
        process.exit(1);
    }
});
// Reset command
program
    .command('reset')
    .description('Reset project to clean state by removing all generated files and configurations')
    .option('--confirm', 'Skip confirmation prompt')
    .action(async (options) => {
    console.log((0, boxen_1.default)(chalk_1.default.bold.red('🔄 Reset Project to Clean State'), {
        padding: 1,
        borderColor: 'red',
        borderStyle: 'round',
        margin: 1
    }));
    const filesToReset = [
        'instructions.yml',
        'CLAUDE.md',
        'copilot-instructions.md',
        '.vscode/settings.json',
        'cursor/rules',
        '.cursorrules'
    ];
    const existingFiles = filesToReset.filter(file => fs.existsSync(file));
    if (existingFiles.length === 0) {
        console.log(chalk_1.default.yellow('ℹ️  Project is already in clean state - no generated files found'));
        return;
    }
    console.log('The following files and directories will be removed:');
    existingFiles.forEach(file => {
        console.log(chalk_1.default.red('   ✗'), file);
    });
    let shouldReset = options.confirm;
    if (!shouldReset) {
        const { confirm } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to reset the project? This will remove all configuration files.',
                default: false
            }
        ]);
        shouldReset = confirm;
    }
    if (!shouldReset) {
        console.log(chalk_1.default.yellow('Reset cancelled'));
        return;
    }
    const spinner = (0, ora_1.default)('Resetting project to clean state...').start();
    try {
        existingFiles.forEach(file => {
            if (fs.existsSync(file)) {
                if (fs.statSync(file).isDirectory()) {
                    fs.rmSync(file, { recursive: true, force: true });
                }
                else {
                    fs.unlinkSync(file);
                }
            }
        });
        // Also clean up .vscode directory if it's empty
        if (fs.existsSync('.vscode')) {
            const vscodeContents = fs.readdirSync('.vscode');
            if (vscodeContents.length === 0) {
                fs.rmdirSync('.vscode');
            }
        }
        // Remove generated entries from .gitignore
        const gitignorePath = './.gitignore';
        if (fs.existsSync(gitignorePath)) {
            let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            const linesToRemove = [
                'cursor/rules/',
                '# Generated by @launchmetrics/rules-package',
                '# WARNING: Do not manually add generated files to git - they should remain gitignored'
            ];
            const lines = gitignoreContent.split('\n');
            const filteredLines = lines.filter(line => !linesToRemove.some(remove => line.includes(remove)));
            // Remove empty lines at the end
            while (filteredLines.length > 0 && filteredLines[filteredLines.length - 1]?.trim() === '') {
                filteredLines.pop();
            }
            if (filteredLines.length !== lines.length) {
                fs.writeFileSync(gitignorePath, filteredLines.join('\n') + (filteredLines.length > 0 ? '\n' : ''));
            }
        }
        spinner.succeed(chalk_1.default.green('Project reset to clean state successfully!'));
        console.log((0, boxen_1.default)(chalk_1.default.green('✨ Clean slate!') + '\n\n' +
            'Your project is now in a clean state.\n\n' +
            chalk_1.default.gray('Next steps:') + '\n' +
            chalk_1.default.gray('• Run ') + chalk_1.default.cyan.bold('instructor init') + chalk_1.default.gray(' to create a new configuration') + '\n' +
            chalk_1.default.gray('• Run ') + chalk_1.default.cyan.bold('instructor install') + chalk_1.default.gray(' to generate config files'), {
            padding: 1,
            borderColor: 'green',
            borderStyle: 'round',
            margin: 1
        }));
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Error resetting project:') + ' ' + (error instanceof Error ? error.message : error));
        process.exit(1);
    }
});
// Preview command
program
    .command('preview')
    .description('Preview what files would be generated without creating them')
    .option('-c, --config <path>', 'Path to instructions.yml file', './instructions.yml')
    .option('--show-content', 'Show file content previews')
    .action(async (options) => {
    console.log((0, boxen_1.default)(chalk_1.default.bold.blue('👁️  Configuration Preview'), {
        padding: 1,
        borderColor: 'blue',
        borderStyle: 'round',
        margin: 1
    }));
    const configPath = path.resolve(options.config);
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
        console.log(chalk_1.default.red('❌ Configuration file not found:'), configPath);
        console.log(chalk_1.default.cyan('💡 Run'), chalk_1.default.white.bold('instructor init'), chalk_1.default.cyan('to create one'));
        process.exit(1);
    }
    try {
        const spinner = (0, ora_1.default)('Analyzing configuration...').start();
        const yamlContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.parse(yamlContent);
        const parser = new parser_1.InstructionParser(config);
        const instructions = parser.parse();
        const generator = new generator_1.FileGenerator();
        const previewItems = await generator.preview(instructions);
        spinner.succeed(chalk_1.default.green('Preview generated successfully!'));
        console.log(chalk_1.default.bold.green(`\n📋 Would generate ${previewItems.length} items:`));
        console.log(chalk_1.default.gray('IDEs:'), instructions.ides.length > 0 ? instructions.ides.join(', ') : chalk_1.default.gray('none'));
        console.log(chalk_1.default.gray('Agents:'), instructions.agents.length > 0 ? instructions.agents.join(', ') : chalk_1.default.gray('none'));
        console.log('');
        // Group by type
        const directories = previewItems.filter(item => item.type === 'directory');
        const files = previewItems.filter(item => item.type === 'file');
        if (directories.length > 0) {
            console.log(chalk_1.default.bold('📁 Directories:'));
            directories.forEach(dir => {
                console.log(chalk_1.default.cyan('   📁'), dir.path);
            });
            console.log('');
        }
        if (files.length > 0) {
            console.log(chalk_1.default.bold('📄 Files:'));
            files.forEach(file => {
                const sizeInfo = file.size ? chalk_1.default.gray(` (${file.size} bytes)`) : '';
                console.log(chalk_1.default.green('   📄'), `${file.path}${sizeInfo}`);
                if (options.showContent && file.preview) {
                    console.log(chalk_1.default.gray('      Preview:'));
                    const lines = file.preview.split('\n').slice(0, 5);
                    lines.forEach(line => {
                        console.log(chalk_1.default.gray('      '), chalk_1.default.dim(line));
                    });
                    if (file.preview.split('\n').length > 5) {
                        console.log(chalk_1.default.gray('      '), chalk_1.default.dim('...'));
                    }
                    console.log('');
                }
            });
        }
        // Show summary
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        console.log((0, boxen_1.default)(chalk_1.default.blue('📊 Summary') + '\n\n' +
            `Files: ${files.length}\n` +
            `Directories: ${directories.length}\n` +
            `Total size: ${totalSize} bytes\n\n` +
            chalk_1.default.gray('Run ') + chalk_1.default.cyan.bold('instructor install') + chalk_1.default.gray(' to create these files'), {
            padding: 1,
            borderColor: 'blue',
            borderStyle: 'round',
            margin: 1
        }));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error generating preview:'), error instanceof Error ? error.message : error);
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map