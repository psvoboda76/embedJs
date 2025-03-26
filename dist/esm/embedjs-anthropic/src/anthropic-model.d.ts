import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseModel, ModelResponse } from '@llm-tools/embedjs-interfaces';
export declare class Anthropic extends BaseModel {
    private readonly debug;
    private readonly modelName;
    private model;
    constructor(params?: {
        temperature?: number;
        modelName?: string;
    });
    init(): Promise<void>;
    runQuery(messages: (AIMessage | SystemMessage | HumanMessage)[]): Promise<ModelResponse>;
}
