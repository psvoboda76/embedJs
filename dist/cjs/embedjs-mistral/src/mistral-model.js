"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mistral = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const mistralai_1 = require("@langchain/mistralai");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class Mistral extends embedjs_interfaces_1.BaseModel {
    debug = (0, debug_1.default)('embedjs:model:Mistral');
    model;
    constructor({ temperature, accessToken, modelName, }) {
        super(temperature);
        this.model = new mistralai_1.ChatMistralAI({ apiKey: accessToken, model: modelName ?? 'mistral-medium' });
    }
    async runQuery(messages) {
        this.debug('Executing mistral model with prompt -', messages[messages.length - 1].content);
        const result = await this.model.invoke(messages);
        this.debug('Mistral response -', result);
        return {
            result: result.content.toString(),
        };
    }
}
exports.Mistral = Mistral;
//# sourceMappingURL=mistral-model.js.map