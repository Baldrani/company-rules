#!/usr/bin/env node

// Simple test to check if our new modules work
const { Command } = require('commander');

try {
  const chalk = require('chalk');
  const inquirer = require('inquirer');
  const ora = require('ora');
  const boxen = require('boxen');
  
  console.log(chalk.green('✅ All imports work!'));
  console.log(boxen(chalk.blue('🚀 Testing CLI Dependencies'), { padding: 1, borderColor: 'blue' }));
  
  const program = new Command();
  program.name('test').version('1.0.0');
  
  program
    .command('test')
    .description('Test command')
    .action(() => {
      console.log(chalk.cyan('Test command works!'));
    });
    
  program.parse();
  
} catch (error) {
  console.error('❌ Import error:', error.message);
}