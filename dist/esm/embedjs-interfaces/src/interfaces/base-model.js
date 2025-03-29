import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import createDebugMessages from 'debug';
import { v4 as uuidv4 } from 'uuid';
export class BaseModel {
    baseDebug = createDebugMessages('embedjs:model:BaseModel');
    static store;
    static defaultTemperature;
    static setDefaultTemperature(temperature) {
        BaseModel.defaultTemperature = temperature;
    }
    static setStore(cache) {
        BaseModel.store = cache;
    }
    _temperature;
    constructor(temperature) {
        this._temperature = temperature;
    }
    get temperature() {
        return this._temperature ?? BaseModel.defaultTemperature;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async init() { }
    extractUniqueSources(supportingContext) {
        const uniqueSources = new Map(); // Use a Map to track unique sources by URL
        supportingContext.forEach((item) => {
            const { metadata } = item;
            if (metadata && metadata.source) {
                // Use the source URL as the key to ensure uniqueness
                if (!uniqueSources.has(metadata.source)) {
                    uniqueSources.set(metadata.source, {
                        source: metadata.source,
                        loaderId: metadata.uniqueLoaderId, // Assuming this field always exists
                    });
                }
            }
        });
        // Convert the values of the Map to an array
        return Array.from(uniqueSources.values());
    }
    async prepare(system, userQuery, supportingContext, pastConversations) {
        const messages = [new SystemMessage(system)];
        messages.push(new SystemMessage(`Supporting context: ${supportingContext.map((s) => s.pageContent).join('; ')}`));
        messages.push(...pastConversations.map((c) => {
            if (c.actor === 'AI')
                return new AIMessage({ content: c.content });
            else if (c.actor === 'SYSTEM')
                return new SystemMessage({ content: c.content });
            else
                return new HumanMessage({ content: c.content });
        }));
        messages.push(new HumanMessage(`${userQuery}?`));
        return messages;
    }
    async query(system, userQuery, supportingContext, conversationId, limitConversation, callback, estimateTokens) {
        let conversation;
        if (conversationId) {
            if (!(await BaseModel.store.hasConversation(conversationId))) {
                this.baseDebug(`Conversation with id '${conversationId}' is new`);
                await BaseModel.store.addConversation(conversationId);
            }
            conversation = await BaseModel.store.getConversation(conversationId);
            this.baseDebug(`${conversation.entries.length} history entries found for conversationId '${conversationId}'`);
            //if we have short context windows we need to limit the conversation history
            if (limitConversation && conversation.entries.length > 0) {
                let userQueryTokens = estimateTokens(userQuery);
                let text = '';
                for (let i = 0; i < conversation.entries.length - 1; i++) {
                    let c = conversation.entries[i];
                    text = text + c.actor + ': ' + c.content + '\n';
                }
                let tokenCount = estimateTokens(text);
                while (conversation.entries.length > 0 && tokenCount + userQueryTokens > limitConversation) {
                    conversation.entries.shift();
                    text = '';
                    for (let i = 0; i < conversation.entries.length - 1; i++) {
                        let c = conversation.entries[i];
                        text = text + c.actor + ': ' + c.content + '\n';
                    }
                    tokenCount = estimateTokens(text);
                }
            }
            // Add user query to history
            await BaseModel.store.addEntryToConversation(conversationId, {
                id: uuidv4(),
                timestamp: new Date(),
                actor: 'HUMAN',
                content: userQuery,
            });
        }
        else {
            this.baseDebug('Conversation history is disabled as no conversationId was provided');
            conversation = { conversationId: 'default', entries: [] };
        }
        const messages = await this.prepare(system, userQuery, supportingContext, conversation.entries.slice(0, -1));
        const uniqueSources = this.extractUniqueSources(supportingContext);
        const timestamp = new Date();
        const id = uuidv4();
        // Run LLM implementation in subclass
        const response = await this.runQuery(messages, callback);
        const newEntry = {
            id,
            timestamp,
            content: response.result,
            actor: 'AI',
            sources: uniqueSources,
        };
        if (conversationId) {
            // Add AI response to history
            await BaseModel.store.addEntryToConversation(conversationId, newEntry);
        }
        return {
            ...newEntry,
            tokenUse: {
                inputTokens: response.tokenUse?.inputTokens ?? 'UNKNOWN',
                outputTokens: response.tokenUse?.outputTokens ?? 'UNKNOWN',
            },
        };
    }
    async simpleQuery(messages) {
        const response = await this.runQuery(messages);
        return {
            result: response.result,
            tokenUse: {
                inputTokens: response.tokenUse?.inputTokens ?? 'UNKNOWN',
                outputTokens: response.tokenUse?.outputTokens ?? 'UNKNOWN',
            },
        };
    }
}
//# sourceMappingURL=base-model.js.map