"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionParser = void 0;
class InstructionParser {
    constructor(config) {
        this.config = config;
    }
    parse() {
        const validation = this.validate();
        if (!validation.valid) {
            throw new Error(`Configuration validation failed:\n${validation.errors.join('\n')}`);
        }
        const instructions = this.parseInstructions(this.config.instructions || []);
        return {
            instructions
        };
    }
    validate() {
        const errors = [];
        const warnings = [];
        // Check required fields
        if (!this.config) {
            errors.push('Configuration is empty or invalid');
            return { valid: false, errors, warnings };
        }
        // Check root structure
        this.validateRootStructure(errors, warnings);
        // Validate instructions
        this.validateInstructions(errors, warnings);
        // Validate file patterns
        this.validateFilePatterns(warnings);
        // Check for logical conflicts
        this.validateLogicalConsistency(warnings);
        return { valid: errors.length === 0, errors, warnings };
    }
    validateRootStructure(errors, warnings) {
        if (typeof this.config !== 'object') {
            errors.push('Configuration must be an object');
            return;
        }
        const validKeys = ['instructions'];
        const extraKeys = Object.keys(this.config).filter(key => !validKeys.includes(key));
        if (extraKeys.length > 0) {
            warnings.push(`Unknown configuration keys will be ignored: ${extraKeys.join(', ')}`);
        }
        if (!this.config.instructions) {
            warnings.push('No instructions defined');
        }
    }
    validateInstructions(errors, warnings) {
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
        const names = [];
        this.config.instructions.forEach((instruction, index) => {
            const instructionNum = index + 1;
            if (typeof instruction === 'string') {
                if (instruction.trim() === '') {
                    errors.push(`Instruction ${instructionNum} is empty`);
                }
                else {
                    names.push(instruction);
                    this.validateInstructionName(instruction, instructionNum, warnings);
                }
            }
            else if (typeof instruction === 'object' && instruction !== null) {
                // Validate object structure
                const validKeys = ['name', 'description', 'files'];
                const extraKeys = Object.keys(instruction).filter(key => !validKeys.includes(key));
                if (extraKeys.length > 0) {
                    warnings.push(`Instruction ${instructionNum} has unknown keys: ${extraKeys.join(', ')}`);
                }
                if (!instruction.name || typeof instruction.name !== 'string') {
                    errors.push(`Instruction ${instructionNum} is missing a valid name`);
                }
                else {
                    if (instruction.name.trim() === '') {
                        errors.push(`Instruction ${instructionNum} has empty name`);
                    }
                    else {
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
                    }
                    else if (instruction.files.trim() === '') {
                        warnings.push(`Instruction ${instructionNum} has empty files pattern`);
                    }
                }
            }
            else {
                errors.push(`Instruction ${instructionNum} must be a string or object, got ${typeof instruction}`);
            }
        });
        // Check for duplicate names
        const duplicates = this.findDuplicates(names);
        if (duplicates.length > 0) {
            warnings.push(`Duplicate instruction names: ${duplicates.join(', ')}`);
        }
    }
    validateInstructionName(name, instructionNum, warnings) {
        if (name.length > 100) {
            warnings.push(`Instruction ${instructionNum} name is very long (${name.length} characters)`);
        }
        if (name !== name.trim()) {
            warnings.push(`Instruction ${instructionNum} name has leading/trailing whitespace`);
        }
    }
    validateFilePatterns(warnings) {
        if (!this.config.instructions || !Array.isArray(this.config.instructions)) {
            return;
        }
        this.config.instructions.forEach((instruction, index) => {
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
    validateLogicalConsistency(warnings) {
        // Check if TypeScript-specific rules are present without TypeScript file patterns
        const hasTypeScriptRules = this.config.instructions?.some((inst) => {
            const name = typeof inst === 'string' ? inst : inst?.name;
            return name && (name.toLowerCase().includes('typescript') ||
                name.toLowerCase().includes('ts') ||
                name.toLowerCase().includes('interface') ||
                name.toLowerCase().includes('type'));
        });
        const hasTypeScriptPatterns = this.config.instructions?.some((inst) => {
            return typeof inst === 'object' && inst?.files && typeof inst.files === 'string' && (inst.files.includes('.ts') ||
                inst.files.includes('.tsx'));
        });
        if (hasTypeScriptRules && !hasTypeScriptPatterns) {
            warnings.push('TypeScript-related rules detected but no TypeScript file patterns specified');
        }
    }
    findDuplicates(arr) {
        const seen = new Set();
        const duplicates = new Set();
        for (const item of arr) {
            if (seen.has(item)) {
                duplicates.add(item);
            }
            else {
                seen.add(item);
            }
        }
        return Array.from(duplicates);
    }
    parseInstructions(rawInstructions) {
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
exports.InstructionParser = InstructionParser;
//# sourceMappingURL=parser.js.map