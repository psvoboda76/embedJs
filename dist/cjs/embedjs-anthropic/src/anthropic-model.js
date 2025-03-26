"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Anthropic = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const anthropic_1 = require("@langchain/anthropic");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class Anthropic extends embedjs_interfaces_1.BaseModel {
    debug = (0, debug_1.default)('embedjs:model:Anthropic');
    modelName;
    model;
    constructor(params) {
        super(params?.temperature);
        this.modelName = params?.modelName ?? 'claude-3-sonnet-20240229';
    }
    async init() {
        this.model = new anthropic_1.ChatAnthropic({ temperature: this.temperature, model: this.modelName });
    }
    async runQuery(messages) {
        this.debug('Executing anthropic model with prompt -', messages[messages.length - 1].content);
        const result = await this.model.invoke(messages);
        this.debug('Anthropic response -', result);
        return {
            result: result.content.toString(),
            tokenUse: {
                inputTokens: result.response_metadata.usage.input_tokens,
                outputTokens: result.response_metadata.usage.output_tokens,
            },
        };
    }
}
exports.Anthropic = Anthropic;
//# sourceMappingURL=anthropic-model.js.map