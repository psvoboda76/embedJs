import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { BaseModel, ModelResponse } from '@llm-tools/embedjs-interfaces';
export declare class Mistral extends BaseModel {
    private readonly debug;
    private model;
    constructor({ temperature, accessToken, modelName, }: {
        temperature?: number;
        accessToken: string;
        modelName?: string;
    });
    runQuery(messages: (AIMessage | SystemMessage | HumanMessage)[]): Promise<ModelResponse>;
}
