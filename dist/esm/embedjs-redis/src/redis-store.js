import { Redis } from 'ioredis';
export class RedisStore {
    static LOADER_METADATA_PREFIX = 'LOADER_METADATA_';
    static CUSTOM_KEYS_PREFIX = 'CUSTOM_KEYS_';
    options;
    redis;
    constructor(options) {
        options.keyPrefix = options.keyPrefix ?? 'EmbedJS';
        this.options = options;
    }
    async init() {
        this.redis = new Redis(this.options);
    }
    async addLoaderMetadata(loaderId, value) {
        await this.redis.set(`${RedisStore.LOADER_METADATA_PREFIX}_${loaderId}`, JSON.stringify(value));
    }
    async getLoaderMetadata(loaderId) {
        const result = await this.redis.get(`${RedisStore.LOADER_METADATA_PREFIX}_${loaderId}`);
        return JSON.parse(result);
    }
    async hasLoaderMetadata(loaderId) {
        return !!(await this.redis.get(`${RedisStore.LOADER_METADATA_PREFIX}_${loaderId}`));
    }
    async getAllLoaderMetadata() {
        const loaderKeys = await this.redis.keys(`${RedisStore.LOADER_METADATA_PREFIX}_*`);
        const loaderEntries = await this.redis.mget(loaderKeys);
        return loaderEntries.map((entry) => JSON.parse(entry));
    }
    async loaderCustomSet(loaderId, key, value) {
        const customKeys = await this.redis.get(`${RedisStore.CUSTOM_KEYS_PREFIX}_${loaderId}`);
        let customKeysList;
        if (!customKeys)
            customKeysList = [];
        else
            customKeysList = JSON.parse(customKeys);
        customKeysList.push(key);
        await this.redis.set(key, JSON.stringify(value));
        await this.redis.set(`${RedisStore.CUSTOM_KEYS_PREFIX}_${loaderId}`, JSON.stringify(customKeysList));
    }
    async loaderCustomGet(key) {
        const result = await this.redis.get(key);
        return JSON.parse(result);
    }
    async loaderCustomHas(key) {
        return !!(await this.redis.get(key));
    }
    async loaderCustomDelete(key) {
        await this.redis.del(key);
    }
    async deleteLoaderMetadataAndCustomValues(loaderId) {
        const customKeys = await this.redis.get(`${RedisStore.CUSTOM_KEYS_PREFIX}_${loaderId}`);
        if (customKeys) {
            const customKeysList = JSON.parse(customKeys);
            for (const key of customKeysList) {
                await this.redis.del(key);
            }
        }
        await this.redis.del(`${RedisStore.LOADER_METADATA_PREFIX}_${loaderId}`);
        await this.redis.del(`${RedisStore.CUSTOM_KEYS_PREFIX}_${loaderId}`);
    }
    async addConversation(conversationId) {
        await this.redis.set(`conversation_${conversationId}`, JSON.stringify({ conversationId, entries: [] }));
    }
    async getConversation(conversationId) {
        const result = await this.redis.get(`conversation_${conversationId}`);
        return JSON.parse(result);
    }
    async hasConversation(conversationId) {
        return !!(await this.redis.get(`conversation_${conversationId}`));
    }
    async deleteConversation(conversationId) {
        await this.redis.del(`conversation_${conversationId}`);
    }
    async addEntryToConversation(conversationId, entry) {
        const conversation = await this.getConversation(conversationId);
        conversation.entries.push(entry);
        await this.redis.set(`conversation_${conversationId}`, JSON.stringify(conversation));
    }
    clearConversations() {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=redis-store.js.map