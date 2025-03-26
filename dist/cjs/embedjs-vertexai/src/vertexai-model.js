"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VertexAI = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const google_vertexai_1 = require("@langchain/google-vertexai");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class VertexAI extends embedjs_interfaces_1.BaseModel {
    debug = (0, debug_1.default)('embedjs:model:VertexAI');
    model;
    constructor({ temperature, modelName }) {
        super(temperature);
        this.model = new google_vertexai_1.ChatVertexAI({ model: modelName ?? 'gemini-1.0-pro' });
    }
    async runQuery(messages) {
        this.debug('Executing VertexAI model with prompt -', messages[messages.length - 1].content);
        const result = await this.model.invoke(messages);
        this.debug('VertexAI response -', result);
        return {
            result: result.content.toString(),
        };
    }
}
exports.VertexAI = VertexAI;
//# sourceMappingURL=vertexai-model.js.map