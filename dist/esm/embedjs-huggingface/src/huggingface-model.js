import createDebugMessages from 'debug';
import { HuggingFaceInference } from '@langchain/community/llms/hf';
import { BaseModel } from '@llm-tools/embedjs-interfaces';
export class HuggingFace extends BaseModel {
    debug = createDebugMessages('embedjs:model:HuggingFace');
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
        this.model = new HuggingFaceInference({
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
//# sourceMappingURL=huggingface-model.js.map