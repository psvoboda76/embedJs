import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseModel, ModelResponse } from '@llm-tools/embedjs-interfaces';
export declare class VertexAI extends BaseModel {
    private readonly debug;
    private model;
    constructor({ temperature, modelName }: {
        temperature?: number;
        modelName?: string;
    });
    runQuery(messages: (AIMessage | SystemMessage | HumanMessage)[]): Promise<ModelResponse>;
}
