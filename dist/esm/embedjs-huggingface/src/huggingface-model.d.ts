import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseModel, ModelResponse } from '@llm-tools/embedjs-interfaces';
export declare class HuggingFace extends BaseModel {
    private readonly debug;
    private readonly modelName;
    private readonly maxNewTokens;
    private readonly endpointUrl?;
    private model;
    constructor(params?: {
        modelName?: string;
        temperature?: number;
        maxNewTokens?: number;
        endpointUrl?: string;
    });
    init(): Promise<void>;
    runQuery(messages: (AIMessage | SystemMessage | HumanMessage)[]): Promise<ModelResponse>;
}
