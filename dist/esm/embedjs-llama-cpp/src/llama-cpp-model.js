import createDebugMessages from 'debug';
import { LlamaCpp as ChatLlamaCpp } from '@langchain/community/llms/llama_cpp';
import { BaseModel } from '@llm-tools/embedjs-interfaces';
export class LlamaCpp extends BaseModel {
    debug = createDebugMessages('embedjs:model:LlamaCpp');
    model;
    constructor({ temperature, modelPath }) {
        super(temperature);
        this.model = new ChatLlamaCpp({
            modelPath: modelPath ?? '',
        });
    }
    async runQuery(messages) {
        this.debug(`Executing LlamaCpp model ${this.model} with prompt -`, messages[messages.length - 1].content);
        const result = await this.model.invoke(messages);
        this.debug('LlamaCpp response -', result);
        return {
            result: result.toString(),
        };
    }
}
//# sourceMappingURL=llama-cpp-model.js.map