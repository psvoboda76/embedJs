"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlamaCpp = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const llama_cpp_1 = require("@langchain/community/llms/llama_cpp");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class LlamaCpp extends embedjs_interfaces_1.BaseModel {
    debug = (0, debug_1.default)('embedjs:model:LlamaCpp');
    model;
    constructor({ temperature, modelPath }) {
        super(temperature);
        this.model = new llama_cpp_1.LlamaCpp({
            modelPath: modelPath ?? '',
        });
    }
    async runQuery(messages) {
        this.debug(`Executing LlamaCpp model ${this.model} with prompt -`, messages[messages.length - 1].content);
        const result = await this.model.invoke(messages);
        this.debug('LlamaCpp response -', result);
        return {
            result: result.toString(),
        };
    }
}
exports.LlamaCpp = LlamaCpp;
//# sourceMappingURL=llama-cpp-model.js.map