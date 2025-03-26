import createDebugMessages from 'debug';
import { ChatMistralAI } from '@langchain/mistralai';
import { BaseModel } from '@llm-tools/embedjs-interfaces';
export class Mistral extends BaseModel {
    debug = createDebugMessages('embedjs:model:Mistral');
    model;
    constructor({ temperature, accessToken, modelName, }) {
        super(temperature);
        this.model = new ChatMistralAI({ apiKey: accessToken, model: modelName ?? 'mistral-medium' });
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
//# sourceMappingURL=mistral-model.js.map