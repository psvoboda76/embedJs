"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLoader = void 0;
const tslib_1 = require("tslib");
const md5_1 = tslib_1.__importDefault(require("md5"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const node_events_1 = require("node:events");
class BaseLoader extends node_events_1.EventEmitter {
    static store;
    static setCache(store) {
        BaseLoader.store = store;
    }
    uniqueId;
    chunkSize;
    chunkOverlap;
    canIncrementallyLoad;
    loaderMetadata;
    constructor(uniqueId, loaderMetadata, chunkSize = 5, chunkOverlap = 0, canIncrementallyLoad = false) {
        super();
        this.uniqueId = uniqueId;
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
        this.loaderMetadata = loaderMetadata;
        this.canIncrementallyLoad = canIncrementallyLoad;
        (0, debug_1.default)('embedjs:loader:BaseLoader')(`New loader class initalized with key ${uniqueId}`);
    }
    getUniqueId() {
        return this.uniqueId;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async init() { }
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    injectModel(_model) { }
    async recordLoaderInCache(chunksProcessed) {
        if (!BaseLoader.store)
            return;
        const loaderData = {
            uniqueId: this.uniqueId,
            type: this.constructor.name,
            loaderMetadata: this.loaderMetadata,
            chunksProcessed,
        };
        await BaseLoader.store.addLoaderMetadata(this.uniqueId, loaderData);
    }
    getCustomCacheKey(key) {
        return `LOADER_CUSTOM_${this.uniqueId}_${key}`;
    }
    async checkInCache(key) {
        if (!BaseLoader.store)
            return false;
        return BaseLoader.store.loaderCustomHas(this.getCustomCacheKey(key));
    }
    async getFromCache(key) {
        if (!BaseLoader.store)
            return null;
        return BaseLoader.store.loaderCustomGet(this.getCustomCacheKey(key));
    }
    async saveToCache(key, value) {
        if (!BaseLoader.store)
            return;
        await BaseLoader.store.loaderCustomSet(this.uniqueId, this.getCustomCacheKey(key), value);
    }
    async deleteFromCache(key) {
        if (!BaseLoader.store)
            return false;
        return BaseLoader.store.loaderCustomDelete(this.getCustomCacheKey(key));
    }
    async loadIncrementalChunk(incrementalGenerator) {
        this.emit('incrementalChunkAvailable', incrementalGenerator);
    }
    /**
     * This TypeScript function asynchronously processes chunks of data, cleans up the content,
     * calculates a content hash, and yields the modified chunks.
     */
    async *getChunks() {
        const chunks = await this.getUnfilteredChunks();
        let count = 0;
        for await (const chunk of chunks) {
            chunk.pageContent = chunk.pageContent
                .replace(/(\r\n|\n|\r)/gm, ' ')
                .replace(/\s\s+/g, ' ')
                .trim();
            if (chunk.pageContent.length > 0) {
                yield {
                    ...chunk,
                    contentHash: (0, md5_1.default)(chunk.pageContent),
                };
                count++;
            }
        }
        await this.recordLoaderInCache(count);
    }
}
exports.BaseLoader = BaseLoader;
//# sourceMappingURL=base-loader.js.map