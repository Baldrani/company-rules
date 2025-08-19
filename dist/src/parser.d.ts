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
export declare class InstructionParser {
    private config;
    constructor(config: any);
    parse(): ParsedInstructions;
    validate(): ValidationResult;
    private validateRootStructure;
    private validateIDEs;
    private validateAgents;
    private validateInstructions;
    private validateInstructionName;
    private validateFilePatterns;
    private validateLogicalConsistency;
    private findDuplicates;
    private parseInstructions;
}
//# sourceMappingURL=parser.d.ts.map