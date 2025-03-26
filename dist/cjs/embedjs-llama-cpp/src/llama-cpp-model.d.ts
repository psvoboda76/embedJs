import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseModel, ModelResponse } from '@llm-tools/embedjs-interfaces';
export declare class LlamaCpp extends BaseModel {
    private readonly debug;
    private model;
    constructor({ temperature, modelPath }: {
        temperature?: number;
        modelPath: string;
    });
    runQuery(messages: (AIMessage | SystemMessage | HumanMessage)[]): Promise<ModelResponse>;
}
