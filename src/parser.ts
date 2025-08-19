export interface Instruction {
  name: string;
  description?: string;
  files?: string;
}

export interface ParsedInstructions {
  ides: string[];
  agents: string[];
  instructions: Instruction[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigSchema {
  ides?: string[];
  agents?: string[];
  instructions?: (string | InstructionSchema)[];
}

export interface InstructionSchema {
  name: string;
  description?: string;
  files?: string;
}

export class InstructionParser {
  constructor(private config: any) {}

  parse(): ParsedInstructions {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`Configuration validation failed:\n${validation.errors.join('\n')}`);
    }

    const ides = this.config.ides || [];
    const agents = this.config.agents || [];
    const instructions = this.parseInstructions(this.config.instructions || []);

    return {
      ides,
      agents,
      instructions
    };
  }

  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!this.config) {
      errors.push('Configuration is empty or invalid');
      return { valid: false, errors, warnings };
    }

    // Check root structure
    this.validateRootStructure(errors, warnings);
    
    // Validate IDEs
    this.validateIDEs(errors, warnings);
    
    // Validate agents
    this.validateAgents(errors, warnings);
    
    // Validate instructions
    this.validateInstructions(errors, warnings);
    
    // Validate file patterns
    this.validateFilePatterns(warnings);
    
    // Check for logical conflicts
    this.validateLogicalConsistency(warnings);

    return { valid: errors.length === 0, errors, warnings };
  }

  private validateRootStructure(errors: string[], warnings: string[]): void {
    if (typeof this.config !== 'object') {
      errors.push('Configuration must be an object');
      return;
    }

    const validKeys = ['ides', 'agents', 'instructions'];
    const extraKeys = Object.keys(this.config).filter(key => !validKeys.includes(key));
    if (extraKeys.length > 0) {
      warnings.push(`Unknown configuration keys will be ignored: ${extraKeys.join(', ')}`);
    }

    if (!this.config.ides && !this.config.agents) {
      warnings.push('No IDEs or agents configured - configuration will have no effect');
    }
  }

  private validateIDEs(errors: string[], warnings: string[]): void {
    if (this.config.ides === undefined) {
      return; // Optional field
    }

    if (!Array.isArray(this.config.ides)) {
      errors.push('ides must be an array');
      return;
    }

    if (this.config.ides.length === 0) {
      warnings.push('No IDEs configured');
      return;
    }

    const supportedIDEs = ['cursor', 'vscode', 'phpstorm', 'webstorm'];
    const duplicates = this.findDuplicates(this.config.ides.map((ide: any) => String(ide).toLowerCase()));
    
    if (duplicates.length > 0) {
      warnings.push(`Duplicate IDEs: ${duplicates.join(', ')}`);
    }

    this.config.ides.forEach((ide: any, index: number) => {
      if (typeof ide !== 'string') {
        errors.push(`IDE ${index + 1} must be a string, got ${typeof ide}`);
        return;
      }

      if (ide.trim() === '') {
        errors.push(`IDE ${index + 1} is empty`);
        return;
      }

      if (!supportedIDEs.includes(ide.toLowerCase())) {
        warnings.push(`Unsupported IDE '${ide}' will be ignored`);
      }
    });
  }

  private validateAgents(errors: string[], warnings: string[]): void {
    if (this.config.agents === undefined) {
      return; // Optional field
    }

    if (!Array.isArray(this.config.agents)) {
      errors.push('agents must be an array');
      return;
    }

    if (this.config.agents.length === 0) {
      warnings.push('No agents configured');
      return;
    }

    const supportedAgents = ['claude', 'copilot', 'codeium'];
    const duplicates = this.findDuplicates(this.config.agents.map((agent: any) => String(agent).toLowerCase()));
    
    if (duplicates.length > 0) {
      warnings.push(`Duplicate agents: ${duplicates.join(', ')}`);
    }

    this.config.agents.forEach((agent: any, index: number) => {
      if (typeof agent !== 'string') {
        errors.push(`Agent ${index + 1} must be a string, got ${typeof agent}`);
        return;
      }

      if (agent.trim() === '') {
        errors.push(`Agent ${index + 1} is empty`);
        return;
      }

      if (!supportedAgents.includes(agent.toLowerCase())) {
        warnings.push(`Unsupported agent '${agent}' will be ignored`);
      }
    });
  }

  private validateInstructions(errors: string[], warnings: string[]): void {
    if (!this.config.instructions) {
      warnings.push('No instructions defined');
      return;
    }

    if (!Array.isArray(this.config.instructions)) {
      errors.push('instructions must be an array');
      return;
    }

    if (this.config.instructions.length === 0) {
      warnings.push('Instructions array is empty');
      return;
    }

    const names: string[] = [];

    this.config.instructions.forEach((instruction: any, index: number) => {
      const instructionNum = index + 1;

      if (typeof instruction === 'string') {
        if (instruction.trim() === '') {
          errors.push(`Instruction ${instructionNum} is empty`);
        } else {
          names.push(instruction);
          this.validateInstructionName(instruction, instructionNum, warnings);
        }
      } else if (typeof instruction === 'object' && instruction !== null) {
        // Validate object structure
        const validKeys = ['name', 'description', 'files'];
        const extraKeys = Object.keys(instruction).filter(key => !validKeys.includes(key));
        if (extraKeys.length > 0) {
          warnings.push(`Instruction ${instructionNum} has unknown keys: ${extraKeys.join(', ')}`);
        }

        if (!instruction.name || typeof instruction.name !== 'string') {
          errors.push(`Instruction ${instructionNum} is missing a valid name`);
        } else {
          if (instruction.name.trim() === '') {
            errors.push(`Instruction ${instructionNum} has empty name`);
          } else {
            names.push(instruction.name);
            this.validateInstructionName(instruction.name, instructionNum, warnings);
          }
        }

        if (instruction.description !== undefined && typeof instruction.description !== 'string') {
          errors.push(`Instruction ${instructionNum} description must be a string`);
        }

        if (instruction.files !== undefined) {
          if (typeof instruction.files !== 'string') {
            errors.push(`Instruction ${instructionNum} files pattern must be a string`);
          } else if (instruction.files.trim() === '') {
            warnings.push(`Instruction ${instructionNum} has empty files pattern`);
          }
        }
      } else {
        errors.push(`Instruction ${instructionNum} must be a string or object, got ${typeof instruction}`);
      }
    });

    // Check for duplicate names
    const duplicates = this.findDuplicates(names);
    if (duplicates.length > 0) {
      warnings.push(`Duplicate instruction names: ${duplicates.join(', ')}`);
    }
  }

  private validateInstructionName(name: string, instructionNum: number, warnings: string[]): void {
    if (name.length > 100) {
      warnings.push(`Instruction ${instructionNum} name is very long (${name.length} characters)`);
    }

    if (name !== name.trim()) {
      warnings.push(`Instruction ${instructionNum} name has leading/trailing whitespace`);
    }
  }

  private validateFilePatterns(warnings: string[]): void {
    if (!this.config.instructions || !Array.isArray(this.config.instructions)) {
      return;
    }

    this.config.instructions.forEach((instruction: any, index: number) => {
      if (typeof instruction === 'object' && instruction?.files && typeof instruction.files === 'string') {
        const pattern = instruction.files;
        
        // Check for common file pattern issues
        if (pattern.includes('**/**')) {
          warnings.push(`Instruction ${index + 1} has redundant glob pattern: ${pattern}`);
        }
        
        if (pattern.startsWith('./')) {
          warnings.push(`Instruction ${index + 1} file pattern starts with './' which may be redundant: ${pattern}`);
        }
      }
    });
  }

  private validateLogicalConsistency(warnings: string[]): void {
    // Check if TypeScript-specific rules are present without TypeScript file patterns
    const hasTypeScriptRules = this.config.instructions?.some((inst: any) => {
      const name = typeof inst === 'string' ? inst : inst?.name;
      return name && (
        name.toLowerCase().includes('typescript') ||
        name.toLowerCase().includes('ts') ||
        name.toLowerCase().includes('interface') ||
        name.toLowerCase().includes('type')
      );
    });

    const hasTypeScriptPatterns = this.config.instructions?.some((inst: any) => {
      return typeof inst === 'object' && inst?.files && typeof inst.files === 'string' && (
        inst.files.includes('.ts') || 
        inst.files.includes('.tsx')
      );
    });

    if (hasTypeScriptRules && !hasTypeScriptPatterns) {
      warnings.push('TypeScript-related rules detected but no TypeScript file patterns specified');
    }
  }

  private findDuplicates(arr: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    
    for (const item of arr) {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    }
    
    return Array.from(duplicates);
  }

  private parseInstructions(rawInstructions: any[]): Instruction[] {
    return rawInstructions.map(instruction => {
      if (typeof instruction === 'string') {
        return { name: instruction };
      }
      
      return {
        name: instruction.name,
        description: instruction.description,
        files: instruction.files
      };
    });
  }
}