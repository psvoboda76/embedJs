import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseModel, ModelResponse } from '@llm-tools/embedjs-interfaces';
export declare class Ollama extends BaseModel {
    private readonly debug;
    private model;
    constructor({ baseUrl, temperature, modelName }: {
        baseUrl?: string;
        temperature?: number;
        modelName?: string;
    });
    runQuery(messages: (AIMessage | SystemMessage | HumanMessage)[], callback?: any): Promise<ModelResponse>;
}
