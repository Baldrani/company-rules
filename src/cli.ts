#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import boxen from 'boxen';
import { InstructionParser } from './parser';
import { FileGenerator, GeneratorInstructions } from './generator';
import { LLMService } from './llm-service';
import { SUPPORTED_IDES, SUPPORTED_AGENTS, DEFAULT_SELECTED_IDES, DEFAULT_SELECTED_AGENTS } from './constants';

const program = new Command();

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
      
      console.log(boxen(
        chalk.bold.blue('🚀 Company Rules Package Installer'),
        { 
          padding: 1, 
          borderColor: 'blue', 
          borderStyle: 'round',
          margin: 1
        }
      ));
      
      // Check if config file exists
      const spinner = ora('Checking configuration file...').start();
      
      if (!fs.existsSync(configPath)) {
        spinner.fail(chalk.red(`Configuration file not found: ${configPath}`));
        console.log(chalk.cyan('💡 To create a configuration file, run:'));
        console.log(chalk.white.bold('   npx instructor init'));
        process.exit(1);
      }
      
      spinner.succeed(chalk.green(`Found configuration: ${path.basename(configPath)}`));
      
      // Parse configuration
      const parseSpinner = ora('Parsing configuration...').start();
      
      const yamlContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.parse(yamlContent);
      
      const parser = new InstructionParser(config);
      const parsedInstructions = parser.parse();
      
      parseSpinner.succeed(chalk.green(`Parsed ${parsedInstructions.instructions.length} instructions`));
      
      if (options.verbose) {
        console.log(chalk.gray('Instructions:'), parsedInstructions.instructions.map(i => i.name).join(', '));
      }

      // Always ask user to choose IDEs and agents (either interactive or use defaults)
      let selectedIdes: string[];
      let selectedAgents: string[];
      let selectedInstructions = parsedInstructions.instructions;

      if (options.interactive) {
        console.log(chalk.cyan('\n🎯 Let\'s customize your installation:\n'));
        
        const choices = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedIdes',
            message: 'Which IDEs would you like to configure?',
            choices: SUPPORTED_IDES.map(ide => ({
              name: `${ide.name} - ${ide.description}`,
              value: ide.value,
              checked: DEFAULT_SELECTED_IDES.includes(ide.value)
            }))
          },
          {
            type: 'checkbox', 
            name: 'selectedAgents',
            message: 'Which AI agents would you like to configure?',
            choices: SUPPORTED_AGENTS.map(agent => ({
              name: `${agent.name} - ${agent.description}`,
              value: agent.value,
              checked: DEFAULT_SELECTED_AGENTS.includes(agent.value)
            }))
          },
          {
            type: 'checkbox',
            name: 'selectedInstructions',
            message: 'Which instructions would you like to include?',
            choices: parsedInstructions.instructions.map(instruction => ({
              name: instruction.name,
              value: instruction.name,
              checked: true
            })),
            when: parsedInstructions.instructions.length > 0
          }
        ]);

        selectedIdes = choices.selectedIdes || DEFAULT_SELECTED_IDES;
        selectedAgents = choices.selectedAgents || DEFAULT_SELECTED_AGENTS;
        selectedInstructions = parsedInstructions.instructions.filter(instruction => 
          choices.selectedInstructions?.includes(instruction.name) ?? true
        );
      } else {
        // Use defaults when not in interactive mode
        selectedIdes = DEFAULT_SELECTED_IDES;
        selectedAgents = DEFAULT_SELECTED_AGENTS;
        selectedInstructions = parsedInstructions.instructions;
      }

      // Create the instructions object for the generator
      const instructions: GeneratorInstructions = {
        ides: selectedIdes,
        agents: selectedAgents,
        instructions: selectedInstructions
      };

      console.log(chalk.green(`\n✅ Configuration: ${instructions.ides.length} IDEs, ${instructions.agents.length} agents, ${instructions.instructions.length} instructions\n`));
      
      // Check LLM availability
      const llmService = LLMService.fromEnvironment();
      if (llmService) {
        console.log(chalk.green('🤖 LLM service detected - will generate rich, detailed instructions'));
      } else {
        console.log(chalk.yellow('⚠️  No LLM API key found - using basic instructions'));
        console.log(chalk.gray('   Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable for enhanced rule generation'));
      }

      // Generate files
      const genSpinner = ora('Generating configuration files...').start();
      const configDir = path.dirname(configPath);
      const generator = new FileGenerator(configDir);
      
      await generator.generate(instructions);
      
      genSpinner.succeed(chalk.green('Configuration files generated successfully!'));
      
      // Show generated files
      console.log(chalk.bold.green('\n📝 Generated files:'));
      const generatedFiles: string[] = [];
      
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
        console.log(chalk.gray('   ✓'), chalk.white(file));
      });
      
      console.log(boxen(
        chalk.green.bold('🎉 Setup complete!') + '\n\n' +
        'Your development environment is now configured with consistent rules.\n' +
        chalk.gray('Run ') + chalk.cyan.bold('instructor status') + chalk.gray(' to see the current configuration.'),
        { 
          padding: 1, 
          borderColor: 'green', 
          borderStyle: 'round',
          margin: 1
        }
      ));
      
    } catch (error) {
      console.error(chalk.red('❌ Error generating configuration files:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Create a sample instructions.yml file')
  .option('--interactive', 'Interactive setup with prompts')
  .action(async (options) => {
    console.log(boxen(
      chalk.bold.magenta('🎯 Initialize Company Rules'),
      { 
        padding: 1, 
        borderColor: 'magenta', 
        borderStyle: 'round',
        margin: 1
      }
    ));

    if (fs.existsSync('./instructions.yml')) {
      console.log(chalk.yellow('📝 instructions.yml already exists and will not be overwritten'));
      console.log(chalk.gray('💡 Check out'), chalk.cyan('examples/instructions.yml'), chalk.gray('for more rule ideas'));
      console.log(chalk.cyan('🚀 Run:'), chalk.white.bold('npx instructor install --interactive'), chalk.gray('to configure your setup'));
      return;
    }

    let config: any;
    
    if (options.interactive) {
      // Interactive setup
      const answers = await inquirer.prompt([
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

      // Build config based on answers (instructions only)
      config = {
        instructions: [] as any[]
      };

      // Add framework-specific rules
      if (answers.frameworks.includes('react-ts')) {
        config.instructions.push(
          { name: 'use tabs instead of spaces', files: '*.{ts,tsx,js,jsx}' },
          { name: 'remove unused imports after changing a file', files: '*.ts,*.tsx' }
        );
      }
      
      if (answers.frameworks.includes('tailwind')) {
        config.instructions.push({ name: 'use tailwind for styling' });
      }

      // Add common rules
      config.instructions.push(
        { name: 'minimize use of ai generated comments' },
        { name: 'do not refactor existing components unless explicitly requested' },
        { name: 'never change assertions to make tests pass', description: 'if a test is failing, update the test to match the expected', files: '*.test' }
      );

      // Add custom rules
      if (answers.customRules.trim()) {
        const customRules = answers.customRules.split(',').map((rule: string) => rule.trim());
        customRules.forEach((rule: string) => {
          if (rule) config.instructions.push({ name: rule });
        });
      }

    } else {
      // Default configuration (instructions only)
      config = {
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
    
    console.log(chalk.green.bold('\n✅ Created instructions.yml'));
    console.log(chalk.gray('📁 Location:'), path.resolve('./instructions.yml'));
    console.log(chalk.gray('📋 Rules defined:'), `${config.instructions.length} coding rules`);
    
    console.log(boxen(
      chalk.green('Next steps:') + '\n\n' +
      chalk.gray('1. Review and customize ') + chalk.cyan('instructions.yml') + '\n' +
      chalk.gray('   💡 Check ') + chalk.cyan('examples/instructions.yml') + chalk.gray(' for more rule ideas') + '\n' +
      chalk.gray('2. Run ') + chalk.cyan.bold('instructor install --interactive') + chalk.gray(' to choose IDEs/agents') + '\n' +
      chalk.gray('3. Use ') + chalk.cyan.bold('instructor validate') + chalk.gray(' to check your setup'),
      { 
        padding: 1, 
        borderColor: 'green', 
        borderStyle: 'round',
        margin: 1
      }
    ));
  });

// Status command
program
  .command('status')
  .description('Show current configuration status')
  .option('-c, --config <path>', 'Path to instructions.yml file', './instructions.yml')
  .action((options) => {
    console.log(boxen(
      chalk.bold.cyan('📊 Configuration Status'),
      { 
        padding: 1, 
        borderColor: 'cyan', 
        borderStyle: 'round',
        margin: 1
      }
    ));

    const configPath = path.resolve(options.config);
    
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red('❌ No configuration file found'));
      console.log(chalk.gray('📁 Looking for:'), configPath);
      console.log(chalk.cyan('💡 Run'), chalk.white.bold('instructor init'), chalk.cyan('to create one'));
      return;
    }

    try {
      const yamlContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.parse(yamlContent);
      const parser = new InstructionParser(config);
      const validation = parser.validate();
      const instructions = parser.parse();

      console.log(chalk.green('✅ Configuration file found'));
      console.log(chalk.gray('📁 Location:'), configPath);
      console.log('');

      // Show instructions count
      console.log(chalk.bold('📋 Instructions:'), `${instructions.instructions.length} rules defined`);
      console.log(chalk.gray('💡 IDEs and agents are selected at runtime'));
      
      if (instructions.instructions.length > 0) {
        console.log(chalk.gray('🔧 Available rules:'), instructions.instructions.slice(0, 5).map(i => i.name).join(', ') + (instructions.instructions.length > 5 ? '...' : ''));
      }

      // Show validation warnings
      if (validation.warnings.length > 0) {
        console.log('');
        console.log(chalk.yellow('⚠️  Warnings:'));
        validation.warnings.forEach(warning => {
          console.log(chalk.yellow('   •'), warning);
        });
      }

      // Check for any existing generated files
      console.log('');
      console.log(chalk.bold('📄 Existing generated files:'));
      const possibleFiles = [
        'CLAUDE.md',
        'copilot-instructions.md',
        'codeium-instructions.md',
        'tabnine-instructions.md',
        'chatgpt-instructions.md',
        'gemini-instructions.md', 
        'sourcegraph-instructions.md',
        'amazon-q-instructions.md',
        '.vscode/settings.json',
        'cursor/rules'
      ];

      const existingFiles = possibleFiles.filter(file => fs.existsSync(file));
      
      if (existingFiles.length > 0) {
        existingFiles.forEach(file => {
          console.log(chalk.green('   ✓'), file);
        });
      } else {
        console.log(chalk.gray('   (none found)'));
      }

      console.log('');
      console.log(chalk.cyan('💡 Run'), chalk.white.bold('instructor install --interactive'), chalk.cyan('to generate configuration files'));

    } catch (error) {
      console.log(chalk.red('❌ Error reading configuration:'), error instanceof Error ? error.message : error);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate instructions.yml configuration')
  .option('-c, --config <path>', 'Path to instructions.yml file', './instructions.yml')
  .action((options) => {
    console.log(boxen(
      chalk.bold.yellow('🔍 Configuration Validation'),
      { 
        padding: 1, 
        borderColor: 'yellow', 
        borderStyle: 'round',
        margin: 1
      }
    ));

    const configPath = path.resolve(options.config);
    
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red('❌ Configuration file not found:'), configPath);
      console.log(chalk.cyan('💡 Run'), chalk.white.bold('instructor init'), chalk.cyan('to create one'));
      process.exit(1);
    }

    try {
      const yamlContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.parse(yamlContent);
      const parser = new InstructionParser(config);
      const validation = parser.validate();

      if (validation.valid) {
        console.log(chalk.green.bold('✅ Configuration is valid!'));
        
        if (validation.warnings.length > 0) {
          console.log('');
          console.log(chalk.yellow('⚠️  Warnings:'));
          validation.warnings.forEach(warning => {
            console.log(chalk.yellow('   •'), warning);
          });
        }
      } else {
        console.log(chalk.red.bold('❌ Configuration has errors:'));
        validation.errors.forEach(error => {
          console.log(chalk.red('   •'), error);
        });
        
        if (validation.warnings.length > 0) {
          console.log('');
          console.log(chalk.yellow('⚠️  Warnings:'));
          validation.warnings.forEach(warning => {
            console.log(chalk.yellow('   •'), warning);
          });
        }
        process.exit(1);
      }

    } catch (error) {
      console.log(chalk.red('❌ Error validating configuration:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Clean command
program
  .command('clean')
  .description('Remove generated configuration files (preserves instructions.yml)')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (options) => {
    console.log(boxen(
      chalk.bold.red('🗑️  Clean Generated Files'),
      { 
        padding: 1, 
        borderColor: 'red', 
        borderStyle: 'round',
        margin: 1
      }
    ));

    const filesToClean = [
      'CLAUDE.md',
      'copilot-instructions.md',
      'codeium-instructions.md',
      'tabnine-instructions.md',
      'chatgpt-instructions.md', 
      'gemini-instructions.md',
      'sourcegraph-instructions.md',
      'amazon-q-instructions.md',
      '.vscode/settings.json',
      'cursor/rules'
    ];

    const existingFiles = filesToClean.filter(file => fs.existsSync(file));
    
    if (existingFiles.length === 0) {
      console.log(chalk.yellow('ℹ️  No generated files found to clean'));
      return;
    }

    console.log('The following generated files will be removed:');
    existingFiles.forEach(file => {
      console.log(chalk.red('   ✗'), file);
    });

    let shouldClean = options.confirm;
    if (!shouldClean) {
      const { confirm } = await inquirer.prompt([
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
      console.log(chalk.yellow('Operation cancelled'));
      return;
    }

    const spinner = ora('Cleaning generated files...').start();
    
    try {
      existingFiles.forEach(file => {
        if (fs.existsSync(file)) {
          if (fs.statSync(file).isDirectory()) {
            fs.rmSync(file, { recursive: true, force: true });
          } else {
            fs.unlinkSync(file);
          }
        }
      });

      // Clean up empty parent directories  
      const directoriesToCheck = ['.vscode', 'cursor'];
      
      directoriesToCheck.forEach(dir => {
        if (fs.existsSync(dir)) {
          try {
            const contents = fs.readdirSync(dir);
            if (contents.length === 0) {
              fs.rmdirSync(dir);
              console.log(chalk.gray(`   ℹ️  Removed empty directory: ${dir}`));
            }
          } catch (error) {
            // Directory might not be empty or have permission issues
            console.log(chalk.yellow(`   ⚠️  Could not remove directory ${dir}: ${error instanceof Error ? error.message : error}`));
          }
        }
      });
      
      spinner.succeed(chalk.green('Generated files cleaned successfully!'));
    } catch (error) {
      spinner.fail(chalk.red('Error cleaning files:') + ' ' + (error instanceof Error ? error.message : error));
      process.exit(1);
    }
  });

// Reset command
program
  .command('reset')
  .alias('clean')
  .description('Reset project to clean state by removing all generated files (preserves instructions.yml)')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (options) => {
    console.log(boxen(
      chalk.bold.red('🔄 Reset Project to Clean State'),
      { 
        padding: 1, 
        borderColor: 'red', 
        borderStyle: 'round',
        margin: 1
      }
    ));

    const filesToReset = [
      'CLAUDE.md',
      'copilot-instructions.md',
      'codeium-instructions.md',
      'tabnine-instructions.md', 
      'chatgpt-instructions.md',
      'gemini-instructions.md',
      'sourcegraph-instructions.md',
      'amazon-q-instructions.md',
      '.vscode/settings.json',
      'cursor/rules',
      '.cursorrules'
    ];

    const existingFiles = filesToReset.filter(file => fs.existsSync(file));
    
    if (existingFiles.length === 0) {
      console.log(chalk.yellow('ℹ️  Project is already in clean state - no generated files found'));
      return;
    }

    console.log('The following generated files and directories will be removed:');
    console.log(chalk.gray('   ℹ️  instructions.yml will be preserved'));
    existingFiles.forEach(file => {
      console.log(chalk.red('   ✗'), file);
    });

    let shouldReset = options.confirm;
    if (!shouldReset) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to reset the project? This will remove all generated configuration files (instructions.yml will be preserved).',
          default: false
        }
      ]);
      shouldReset = confirm;
    }

    if (!shouldReset) {
      console.log(chalk.yellow('Reset cancelled'));
      return;
    }

    const spinner = ora('Resetting project to clean state...').start();
    
    try {
      existingFiles.forEach(file => {
        if (fs.existsSync(file)) {
          if (fs.statSync(file).isDirectory()) {
            fs.rmSync(file, { recursive: true, force: true });
          } else {
            fs.unlinkSync(file);
          }
        }
      });

      // Clean up empty parent directories
      const directoriesToCheck = ['.vscode', 'cursor'];
      
      directoriesToCheck.forEach(dir => {
        if (fs.existsSync(dir)) {
          try {
            const contents = fs.readdirSync(dir);
            if (contents.length === 0) {
              fs.rmdirSync(dir);
              console.log(chalk.gray(`   ℹ️  Removed empty directory: ${dir}`));
            }
          } catch (error) {
            // Directory might not be empty or have permission issues
            console.log(chalk.yellow(`   ⚠️  Could not remove directory ${dir}: ${error instanceof Error ? error.message : error}`));
          }
        }
      });

      // Remove generated entries from .gitignore
      const gitignorePath = './.gitignore';
      if (fs.existsSync(gitignorePath)) {
        let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        const linesToRemove = [
          'cursor/rules/',
          'CLAUDE.md',
          'copilot-instructions.md',
          'codeium-instructions.md',
          'tabnine-instructions.md',
          'chatgpt-instructions.md',
          'gemini-instructions.md',
          'sourcegraph-instructions.md',
          'amazon-q-instructions.md',
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
      
      spinner.succeed(chalk.green('Project reset to clean state successfully!'));

      console.log(boxen(
        chalk.green('✨ Clean slate!') + '\n\n' +
        'Your project is now in a clean state.\n\n' +
        chalk.gray('Next steps:') + '\n' +
        chalk.gray('• Run ') + chalk.cyan.bold('instructor init') + chalk.gray(' to create a new configuration') + '\n' +
        chalk.gray('• Run ') + chalk.cyan.bold('instructor install') + chalk.gray(' to generate config files'),
        { 
          padding: 1, 
          borderColor: 'green', 
          borderStyle: 'round',
          margin: 1
        }
      ));

    } catch (error) {
      spinner.fail(chalk.red('Error resetting project:') + ' ' + (error instanceof Error ? error.message : error));
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
    console.log(boxen(
      chalk.bold.blue('👁️  Configuration Preview'),
      { 
        padding: 1, 
        borderColor: 'blue', 
        borderStyle: 'round',
        margin: 1
      }
    ));

    const configPath = path.resolve(options.config);
    
    // Check if config file exists
    if (!fs.existsSync(configPath)) {
      console.log(chalk.red('❌ Configuration file not found:'), configPath);
      console.log(chalk.cyan('💡 Run'), chalk.white.bold('instructor init'), chalk.cyan('to create one'));
      process.exit(1);
    }

    try {
      const spinner = ora('Analyzing configuration...').start();
      
      const yamlContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.parse(yamlContent);
      
      const parser = new InstructionParser(config);
      const parsedInstructions = parser.parse();
      
      // Use defaults for preview since IDEs/agents are runtime choices
      const previewInstructions: GeneratorInstructions = {
        ides: DEFAULT_SELECTED_IDES,
        agents: DEFAULT_SELECTED_AGENTS,
        instructions: parsedInstructions.instructions
      };
      
      const configDir = path.dirname(configPath);
      const generator = new FileGenerator(configDir);
      const previewItems = await generator.preview(previewInstructions);
      
      spinner.succeed(chalk.green('Preview generated successfully!'));

      console.log(chalk.bold.green(`\n📋 Would generate ${previewItems.length} items:`));
      console.log(chalk.gray('Preview using defaults:'), DEFAULT_SELECTED_IDES.join(', '), 'and', DEFAULT_SELECTED_AGENTS.join(', '));
      console.log(chalk.gray('Instructions:'), `${parsedInstructions.instructions.length} rules`);
      console.log('');

      // Group by type
      const directories = previewItems.filter(item => item.type === 'directory');
      const files = previewItems.filter(item => item.type === 'file');

      if (directories.length > 0) {
        console.log(chalk.bold('📁 Directories:'));
        directories.forEach(dir => {
          console.log(chalk.cyan('   📁'), dir.path);
        });
        console.log('');
      }

      if (files.length > 0) {
        console.log(chalk.bold('📄 Files:'));
        files.forEach(file => {
          const sizeInfo = file.size ? chalk.gray(` (${file.size} bytes)`) : '';
          console.log(chalk.green('   📄'), `${file.path}${sizeInfo}`);
          
          if (options.showContent && file.preview) {
            console.log(chalk.gray('      Preview:'));
            const lines = file.preview.split('\n').slice(0, 5);
            lines.forEach(line => {
              console.log(chalk.gray('      '), chalk.dim(line));
            });
            if (file.preview.split('\n').length > 5) {
              console.log(chalk.gray('      '), chalk.dim('...'));
            }
            console.log('');
          }
        });
      }

      // Show summary
      const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
      console.log(boxen(
        chalk.blue('📊 Summary') + '\n\n' +
        `Files: ${files.length}\n` +
        `Directories: ${directories.length}\n` +
        `Total size: ${totalSize} bytes\n\n` +
        chalk.gray('Run ') + chalk.cyan.bold('instructor install') + chalk.gray(' to create these files'),
        { 
          padding: 1, 
          borderColor: 'blue', 
          borderStyle: 'round',
          margin: 1
        }
      ));

    } catch (error) {
      console.error(chalk.red('❌ Error generating preview:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();