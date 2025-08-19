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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileGenerator = exports.InstructionParser = exports.agentTemplates = exports.ideTemplates = exports.defaultRules = exports.CompanyRulesManager = void 0;
class CompanyRulesManager {
    constructor(config) {
        this.config = {
            ide: [],
            agent: [],
            global: {
                typescript: true,
                eslint: true,
                prettier: true,
                husky: true
            },
            ...config
        };
    }
    getIDEConfig(ideName) {
        return this.config.ide.find(ide => ide.name === ideName);
    }
    getAgentConfig(agentName) {
        return this.config.agent.find(agent => agent.name === agentName);
    }
    addRule(target, targetName, rule) {
        if (target === 'ide') {
            const ideConfig = this.config.ide.find(ide => ide.name === targetName);
            if (ideConfig) {
                // IDE rules would be stored in settings
                ideConfig.settings.rules = ideConfig.settings.rules || [];
                ideConfig.settings.rules.push(rule);
            }
        }
        else {
            const agentConfig = this.config.agent.find(agent => agent.name === targetName);
            if (agentConfig) {
                agentConfig.rules.push(rule);
            }
        }
    }
    instantiateForProject(projectPath) {
        const setupInstructions = [];
        if (this.config.global.typescript) {
            setupInstructions.push('Initialize TypeScript configuration');
        }
        if (this.config.global.eslint) {
            setupInstructions.push('Set up ESLint with company rules');
        }
        if (this.config.global.prettier) {
            setupInstructions.push('Configure Prettier formatting');
        }
        if (this.config.global.husky) {
            setupInstructions.push('Install Husky git hooks');
        }
        return {
            ideConfigs: this.config.ide,
            agentConfigs: this.config.agent,
            setupInstructions
        };
    }
    exportConfig() {
        return { ...this.config };
    }
}
exports.CompanyRulesManager = CompanyRulesManager;
__exportStar(require("../types"), exports);
var rules_1 = require("./rules");
Object.defineProperty(exports, "defaultRules", { enumerable: true, get: function () { return rules_1.defaultRules; } });
var ide_1 = require("./templates/ide");
Object.defineProperty(exports, "ideTemplates", { enumerable: true, get: function () { return ide_1.ideTemplates; } });
var agent_1 = require("./templates/agent");
Object.defineProperty(exports, "agentTemplates", { enumerable: true, get: function () { return agent_1.agentTemplates; } });
var parser_1 = require("./parser");
Object.defineProperty(exports, "InstructionParser", { enumerable: true, get: function () { return parser_1.InstructionParser; } });
var generator_1 = require("./generator");
Object.defineProperty(exports, "FileGenerator", { enumerable: true, get: function () { return generator_1.FileGenerator; } });
//# sourceMappingURL=index.js.map