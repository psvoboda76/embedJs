import { AzureChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseModel, ModelResponse } from '@llm-tools/embedjs-interfaces';
export declare class AzureOpenAi extends BaseModel {
    private readonly configuration;
    private readonly debug;
    private model;
    constructor(configuration: ConstructorParameters<typeof AzureChatOpenAI>[0]);
    init(): Promise<void>;
    runQuery(messages: (AIMessage | SystemMessage | HumanMessage)[]): Promise<ModelResponse>;
}
