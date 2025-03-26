import createDebugMessages from 'debug';
import { AzureChatOpenAI } from '@langchain/openai';
import { BaseModel } from '@llm-tools/embedjs-interfaces';
export class AzureOpenAi extends BaseModel {
    configuration;
    debug = createDebugMessages('embedjs:model:OpenAi');
    model;
    constructor(configuration) {
        super(configuration.temperature);
        this.configuration = configuration;
    }
    async init() {
        this.model = new AzureChatOpenAI(this.configuration);
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
//# sourceMappingURL=azure-openai-model.js.map