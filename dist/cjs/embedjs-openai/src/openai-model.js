"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAi = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const openai_1 = require("@langchain/openai");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class OpenAi extends embedjs_interfaces_1.BaseModel {
    configuration;
    debug = (0, debug_1.default)('embedjs:model:OpenAi');
    model;
    constructor(configuration) {
        super(configuration.temperature);
        this.configuration = configuration;
    }
    async init() {
        this.model = new openai_1.ChatOpenAI(this.configuration);
    }
    async runQuery(messages, callback) {
        this.debug('Executing OpenAI model with prompt -', messages[messages.length - 1].content);
        if (callback) {
            const stream = await this.model.stream(messages);
            const chunks = [];
            for await (const chunk of stream) {
                if (chunk.content != null) {
                    chunks.push(chunk.content);
                    callback(chunk.content);
                }
                else {
                    chunks.push(chunk);
                    callback(chunk);
                }
            }
            let res = chunks.join('');
            return {
                result: res,
            };
        }
        else {
            const result = await this.model.invoke(messages);
            this.debug('OpenAI response -', result);
            return {
                result: result.content.toString(),
                tokenUse: {
                    inputTokens: result.response_metadata.tokenUsage.promptTokens,
                    outputTokens: result.response_metadata.tokenUsage.completionTokens,
                },
            };
        }
    }
}
exports.OpenAi = OpenAi;
//# sourceMappingURL=openai-model.js.map