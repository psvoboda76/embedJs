import createDebugMessages from 'debug';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { BaseModel } from '@llm-tools/embedjs-interfaces';
export class VertexAI extends BaseModel {
    debug = createDebugMessages('embedjs:model:VertexAI');
    model;
    constructor({ temperature, modelName }) {
        super(temperature);
        this.model = new ChatVertexAI({ model: modelName ?? 'gemini-1.0-pro' });
    }
    async runQuery(messages) {
        this.debug('Executing VertexAI model with prompt -', messages[messages.length - 1].content);
        const result = await this.model.invoke(messages);
        this.debug('VertexAI response -', result);
        return {
            result: result.content.toString(),
        };
    }
}
//# sourceMappingURL=vertexai-model.js.map