export class MemoryStore {
    loaderCustomValues;
    loaderCustomValuesMap;
    loaderList;
    conversations;
    async init() {
        this.loaderList = {};
        this.loaderCustomValues = {};
        this.conversations = new Map();
        this.loaderCustomValuesMap = new Map();
    }
    async addLoaderMetadata(loaderId, value) {
        this.loaderList[loaderId] = value;
    }
    async getLoaderMetadata(loaderId) {
        return this.loaderList[loaderId];
    }
    async hasLoaderMetadata(loaderId) {
        return !!this.loaderList[loaderId];
    }
    async getAllLoaderMetadata() {
        return Object.values(this.loaderList);
    }
    async loaderCustomSet(loaderId, key, value) {
        if (!this.loaderCustomValuesMap.has(loaderId))
            this.loaderCustomValuesMap.set(loaderId, []);
        this.loaderCustomValuesMap.get(loaderId).push(key);
        this.loaderCustomValues[key] = { ...value, loaderId };
    }
    async loaderCustomGet(key) {
        const data = this.loaderCustomValues[key];
        delete data.loaderId;
        return data;
    }
    async loaderCustomHas(key) {
        return !!this.loaderCustomValues[key];
    }
    async loaderCustomDelete(key) {
        const loaderId = this.loaderCustomValues[key].loaderId;
        delete this.loaderList[key];
        if (this.loaderCustomValuesMap.has(loaderId)) {
            this.loaderCustomValuesMap.set(loaderId, this.loaderCustomValuesMap.get(loaderId).filter((k) => k !== key));
        }
    }
    async deleteLoaderMetadataAndCustomValues(loaderId) {
        if (this.loaderCustomValuesMap.has(loaderId)) {
            this.loaderCustomValuesMap.get(loaderId).forEach((key) => {
                delete this.loaderCustomValues[key];
            });
        }
        this.loaderCustomValuesMap.delete(loaderId);
        delete this.loaderList[loaderId];
    }
    async addConversation(conversationId) {
        if (!this.conversations.has(conversationId)) {
            this.conversations.set(conversationId, { conversationId, entries: [] });
        }
    }
    async getConversation(conversationId) {
        return this.conversations.get(conversationId);
    }
    async hasConversation(conversationId) {
        return this.conversations.has(conversationId);
    }
    async deleteConversation(conversationId) {
        this.conversations.delete(conversationId);
    }
    async addEntryToConversation(conversationId, entry) {
        const conversation = await this.getConversation(conversationId);
        conversation.entries.push(entry);
    }
    async clearConversations() {
        this.conversations.clear();
    }
}
//# sourceMappingURL=memory-store.js.map