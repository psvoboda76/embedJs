import createDebugMessages from 'debug';
import { Ollama as ChatOllamaAI } from '@langchain/ollama';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseModel, ModelResponse } from '@llm-tools/embedjs-interfaces';

export class Ollama extends BaseModel {
    private readonly debug = createDebugMessages('embedjs:model:Ollama');
    private model: ChatOllamaAI;

    constructor({ baseUrl, temperature, modelName }: { baseUrl?: string; temperature?: number; modelName?: string }) {
        super(temperature);
        this.model = new ChatOllamaAI({
            model: modelName ?? 'llama2',
            baseUrl: baseUrl ?? 'http://localhost:11434',
        });
    }

    override async runQuery(
        messages: (AIMessage | SystemMessage | HumanMessage)[],
        callback?: any,
    ): Promise<ModelResponse> {
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
        } else {
            const result = await this.model.invoke(messages);
            this.debug('Ollama response -', result);

            return {
                result: result.toString(),
            };
        }
    }
}
