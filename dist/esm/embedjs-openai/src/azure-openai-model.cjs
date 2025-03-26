"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureOpenAi = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const openai_1 = require("@langchain/openai");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class AzureOpenAi extends embedjs_interfaces_1.BaseModel {
    configuration;
    debug = (0, debug_1.default)('embedjs:model:OpenAi');
    model;
    constructor(configuration) {
        super(configuration.temperature);
        this.configuration = configuration;
    }
    async init() {
        this.model = new openai_1.AzureChatOpenAI(this.configuration);
    }
    async runQuery(messages) {
        this.debug('Executing Azure OpenAI model with prompt -', messages[messages.length - 1].content);
        const result = await this.model.invoke(messages);
        this.debug('Azure OpenAI response -', result);
        return {
            result: result.content.toString(),
            tokenUse: {
                inputTokens: result.response_metadata.tokenUsage.promptTokens,
                outputTokens: result.response_metadata.tokenUsage.completionTokens,
            },
        };
    }
}
exports.AzureOpenAi = AzureOpenAi;
//# sourceMappingURL=azure-openai-model.js.map