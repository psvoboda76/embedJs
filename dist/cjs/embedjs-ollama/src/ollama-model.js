"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ollama = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const ollama_1 = require("@langchain/ollama");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class Ollama extends embedjs_interfaces_1.BaseModel {
    debug = (0, debug_1.default)('embedjs:model:Ollama');
    model;
    constructor({ baseUrl, temperature, modelName }) {
        super(temperature);
        this.model = new ollama_1.Ollama({
            model: modelName ?? 'llama2',
            baseUrl: baseUrl ?? 'http://localhost:11434',
        });
    }
    async runQuery(messages, callback) {
        this.debug(`Executing ollama model ${this.model} with prompt -`, messages[messages.length - 1].content);
        if (callback) {
            const stream = await this.model.stream(messages);
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
                callback(chunk);
            }
            let res = chunks.join('');
            return {
                result: res,
            };
        }
        else {
            const result = await this.model.invoke(messages);
            this.debug('Ollama response -', result);
            return {
                result: result.toString(),
            };
        }
    }
}
exports.Ollama = Ollama;
//# sourceMappingURL=ollama-model.js.map