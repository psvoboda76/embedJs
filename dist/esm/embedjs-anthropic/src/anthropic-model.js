import createDebugMessages from 'debug';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseModel } from '@llm-tools/embedjs-interfaces';
export class Anthropic extends BaseModel {
    debug = createDebugMessages('embedjs:model:Anthropic');
    modelName;
    model;
    constructor(params) {
        super(params?.temperature);
        this.modelName = params?.modelName ?? 'claude-3-sonnet-20240229';
    }
    async init() {
        this.model = new ChatAnthropic({ temperature: this.temperature, model: this.modelName });
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
//# sourceMappingURL=anthropic-model.js.map