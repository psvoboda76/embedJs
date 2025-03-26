import createDebugMessages from 'debug';
import { ChatOpenAI } from '@langchain/openai';
import { BaseModel } from '@llm-tools/embedjs-interfaces';
export class OpenAi extends BaseModel {
    configuration;
    debug = createDebugMessages('embedjs:model:OpenAi');
    model;
    constructor(configuration) {
        super(configuration.temperature);
        this.configuration = configuration;
    }
    async init() {
        this.model = new ChatOpenAI(this.configuration);
    }
    async runQuery(messages, callback) {
        this.debug('Executing OpenAI model with prompt -', messages[messages.length - 1].content);
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
//# sourceMappingURL=openai-model.js.map