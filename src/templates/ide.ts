import { IDEConfig } from '../../types';

export const ideTemplates: { [key: string]: IDEConfig } = {
  vscode: {
    name: 'Visual Studio Code',
    settings: {
      'typescript.preferences.noSemicolons': 'off',
      'editor.formatOnSave': true,
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': true
      },
      'eslint.validate': ['javascript', 'typescript'],
      'editor.tabSize': 2,
      'editor.insertSpaces': true,
      'files.trimTrailingWhitespace': true,
      'files.insertFinalNewline': true
    },
    extensions: [
      'ms-vscode.vscode-typescript-next',
      'dbaeumer.vscode-eslint',
      'esbenp.prettier-vscode',
      'bradlc.vscode-tailwindcss',
      'ms-vscode.vscode-json'
    ],
    tasks: [
      {
        label: 'Build',
        type: 'shell',
        command: 'npm',
        args: ['run', 'build'],
        group: 'build'
      },
      {
        label: 'Lint',
        type: 'shell',
        command: 'npm',
        args: ['run', 'lint'],
        group: 'test'
      }
    ]
  },
  webstorm: {
    name: 'WebStorm',
    settings: {
      'eslint.enable': true,
      'prettier.enable': true,
      'typescript.format.enable': true,
      'javascript.format.enable': true,
      'code.style.scheme': 'Project'
    },
    extensions: [],
    tasks: [
      {
        label: 'npm build',
        type: 'npm',
        command: 'build'
      }
    ]
  },
  cursor: {
    name: 'Cursor',
    settings: {
      'typescript.preferences.noSemicolons': 'off',
      'editor.formatOnSave': true,
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': true
      },
      'cursor.chat.model': 'claude-3-5-sonnet-20241022',
      'cursor.composer.model': 'claude-3-5-sonnet-20241022'
    },
    extensions: [
      'ms-vscode.vscode-typescript-next',
      'dbaeumer.vscode-eslint',
      'esbenp.prettier-vscode'
    ],
    tasks: [
      {
        label: 'Build with Cursor',
        type: 'shell',
        command: 'npm',
        args: ['run', 'build'],
        group: 'build'
      }
    ]
  }
};