import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { Chunk, QueryResponse, Message, ModelResponse } from '../types.js';
import { BaseStore } from './base-store.js';
export declare abstract class BaseModel {
    private readonly baseDebug;
    private static store;
    private static defaultTemperature;
    static setDefaultTemperature(temperature?: number): void;
    static setStore(cache: BaseStore): void;
    private readonly _temperature?;
    constructor(temperature?: number);
    get temperature(): number;
    init(): Promise<void>;
    private extractUniqueSources;
    prepare(system: string, userQuery: string, supportingContext: Chunk[], pastConversations: Message[]): Promise<(AIMessage | SystemMessage | HumanMessage)[]>;
    query(system: string, userQuery: string, supportingContext: Chunk[], conversationId?: string, limitConversation?: number, callback?: any, estimateTokens?: (text: string) => number): Promise<QueryResponse>;
    simpleQuery(messages: (AIMessage | SystemMessage | HumanMessage)[]): Promise<{
        result: string;
        tokenUse: {
            inputTokens: string | number;
            outputTokens: string | number;
        };
    }>;
    protected abstract runQuery(messages: (AIMessage | SystemMessage | HumanMessage)[], callback?: any): Promise<ModelResponse>;
}
