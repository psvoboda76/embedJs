"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuggingFace = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const hf_1 = require("@langchain/community/llms/hf");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class HuggingFace extends embedjs_interfaces_1.BaseModel {
    debug = (0, debug_1.default)('embedjs:model:HuggingFace');
    modelName;
    maxNewTokens;
    endpointUrl;
    model;
    constructor(params) {
        super(params?.temperature);
        this.endpointUrl = params?.endpointUrl;
        this.maxNewTokens = params?.maxNewTokens ?? 300;
        this.modelName = params?.modelName ?? 'mistralai/Mixtral-8x7B-Instruct-v0.1';
    }
    async init() {
        this.model = new hf_1.HuggingFaceInference({
            model: this.modelName,
            maxTokens: this.maxNewTokens,
            temperature: this.temperature,
            endpointUrl: this.endpointUrl,
            verbose: false,
            maxRetries: 1,
        });
    }
    async runQuery(messages) {
        this.debug(`Executing hugging face '${this.model.model}' model with prompt -`, messages[messages.length - 1].content);
        const finalPrompt = messages.reduce((previous, entry) => {
            return `${previous}\n${entry.content}`;
        }, '');
        // this.debug('Final prompt being sent to HF - ', finalPrompt);
        const result = await this.model.invoke(finalPrompt);
        this.debug('Hugging response -', result);
        return {
            result,
        };
    }
}
exports.HuggingFace = HuggingFace;
//# sourceMappingURL=huggingface-model.js.map