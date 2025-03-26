"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LmdbStore = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const lmdb = tslib_1.__importStar(require("lmdb"));
class LmdbStore {
    debug = (0, debug_1.default)('embedjs:store:LmdbStore');
    static LOADER_METADATA_PREFIX = 'LOADER_METADATA_';
    static CUSTOM_KEYS_PREFIX = 'CUSTOM_KEYS_';
    dataPath;
    database;
    constructor({ path }) {
        this.dataPath = path;
    }
    async init() {
        this.debug(`Opening LMDB connection with path - ${this.dataPath}`);
        this.database = lmdb.open({
            path: this.dataPath,
            compression: true,
        });
    }
    async addLoaderMetadata(loaderId, value) {
        let loaderKeys;
        if (this.database.doesExist(`${LmdbStore.LOADER_METADATA_PREFIX}_ALL`))
            loaderKeys = this.database.get(`${LmdbStore.LOADER_METADATA_PREFIX}_ALL`);
        else
            loaderKeys = { list: [] };
        loaderKeys.list.push(loaderId);
        await this.database.put(`${LmdbStore.LOADER_METADATA_PREFIX}_ALL`, loaderKeys);
        await this.database.put(`${LmdbStore.LOADER_METADATA_PREFIX}_${loaderId}`, value);
    }
    async getLoaderMetadata(loaderId) {
        return this.database.get(`${LmdbStore.LOADER_METADATA_PREFIX}_${loaderId}`);
    }
    async hasLoaderMetadata(loaderId) {
        return this.database.doesExist(`${LmdbStore.LOADER_METADATA_PREFIX}_${loaderId}`);
    }
    async getAllLoaderMetadata() {
        const loaderKeys = this.database.get(`${LmdbStore.LOADER_METADATA_PREFIX}_ALL`);
        return loaderKeys.list.map((loaderId) => this.database.get(`${LmdbStore.LOADER_METADATA_PREFIX}_${loaderId}`));
    }
    async loaderCustomSet(loaderId, key, value) {
        let customKeys;
        if (this.database.doesExist(`${LmdbStore.CUSTOM_KEYS_PREFIX}_${loaderId}`))
            customKeys = this.database.get(`${LmdbStore.CUSTOM_KEYS_PREFIX}_${loaderId}`);
        else
            customKeys = { list: [] };
        customKeys.list.push(key);
        await this.database.put(`${LmdbStore.CUSTOM_KEYS_PREFIX}_${loaderId}`, customKeys);
        await this.database.put(key, { ...value, loaderId });
    }
    async loaderCustomGet(key) {
        const data = this.database.get(key);
        delete data.loaderId;
        return data;
    }
    async loaderCustomHas(key) {
        return this.database.doesExist(key);
    }
    async loaderCustomDelete(key) {
        const { loaderId } = this.database.get(key);
        const customKeys = this.database.get(`${LmdbStore.CUSTOM_KEYS_PREFIX}_${loaderId}`);
        customKeys.list = customKeys.list.filter((k) => k !== key);
        await this.database.put(`${LmdbStore.CUSTOM_KEYS_PREFIX}_${loaderId}`, customKeys);
        await this.database.remove(key);
    }
    async deleteLoaderMetadataAndCustomValues(loaderId) {
        const customKeys = this.database.get(`${LmdbStore.CUSTOM_KEYS_PREFIX}_${loaderId}`);
        for (const key of customKeys.list) {
            await this.database.remove(key);
        }
        await this.database.remove(`${LmdbStore.CUSTOM_KEYS_PREFIX}_${loaderId}`);
        await this.database.remove(`${LmdbStore.LOADER_METADATA_PREFIX}_${loaderId}`);
    }
    async addConversation(conversationId) {
        await this.database.put(`conversation_${conversationId}`, { conversationId, entries: [] });
    }
    async getConversation(conversationId) {
        return this.database.get(`conversation_${conversationId}`);
    }
    async hasConversation(conversationId) {
        return this.database.doesExist(`conversation_${conversationId}`);
    }
    async deleteConversation(conversationId) {
        await this.database.remove(`conversation_${conversationId}`);
    }
    async addEntryToConversation(conversationId, entry) {
        const conversation = await this.getConversation(conversationId);
        conversation.entries.push(entry);
        await this.database.put(`conversation_${conversationId}`, conversation);
    }
    async clearConversations() {
        throw new Error('Method not implemented.');
    }
}
exports.LmdbStore = LmdbStore;
//# sourceMappingURL=lmdb-store.js.map