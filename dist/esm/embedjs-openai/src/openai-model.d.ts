import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseModel, ModelResponse } from '@llm-tools/embedjs-interfaces';
export declare class OpenAi extends BaseModel {
    private readonly configuration;
    private readonly debug;
    private model;
    constructor(configuration: ConstructorParameters<typeof ChatOpenAI>[0]);
    init(): Promise<void>;
    runQuery(messages: (AIMessage | SystemMessage | HumanMessage)[], callback?: any): Promise<ModelResponse>;
}
