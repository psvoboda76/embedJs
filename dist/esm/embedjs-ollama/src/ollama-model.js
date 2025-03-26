import createDebugMessages from 'debug';
import { Ollama as ChatOllamaAI } from '@langchain/ollama';
import { BaseModel } from '@llm-tools/embedjs-interfaces';
export class Ollama extends BaseModel {
    debug = createDebugMessages('embedjs:model:Ollama');
    model;
    constructor({ baseUrl, temperature, modelName }) {
        super(temperature);
        this.model = new ChatOllamaAI({
            model: modelName ?? 'llama2',
            baseUrl: baseUrl ?? 'http://localhost:11434',
        });
    }
    async runQuery(messages, callback) {
        this.debug(`Executing ollama model ${this.model} with prompt -`, messages[messages.length - 1].content);
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
            this.debug('Ollama response -', result);
            return {
                result: result.toString(),
            };
        }
    }
}
//# sourceMappingURL=ollama-model.js.map