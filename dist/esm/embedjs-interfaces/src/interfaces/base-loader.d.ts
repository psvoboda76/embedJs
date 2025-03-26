import { EventEmitter } from 'node:events';
import { BaseStore } from './base-store.js';
import { LoaderChunk, UnfilteredLoaderChunk } from '../types.js';
import { BaseModel } from './base-model.js';
export declare abstract class BaseLoader<MetadataTemplate extends Record<string, string | number | boolean> = Record<string, string | number | boolean>, CacheTemplate extends Record<string, unknown> = Record<string, unknown>> extends EventEmitter {
    private static store;
    static setCache(store: BaseStore): void;
    protected readonly uniqueId: string;
    protected readonly chunkSize: number;
    protected readonly chunkOverlap: number;
    readonly canIncrementallyLoad: boolean;
    protected readonly loaderMetadata: Record<string, unknown>;
    constructor(uniqueId: string, loaderMetadata: Record<string, unknown>, chunkSize?: number, chunkOverlap?: number, canIncrementallyLoad?: boolean);
    getUniqueId(): string;
    init(): Promise<void>;
    injectModel(_model: BaseModel): void;
    private recordLoaderInCache;
    private getCustomCacheKey;
    protected checkInCache(key: string): Promise<boolean>;
    protected getFromCache(key: string): Promise<CacheTemplate>;
    protected saveToCache(key: string, value: CacheTemplate): Promise<void>;
    protected deleteFromCache(key: string): Promise<false | void>;
    protected loadIncrementalChunk(incrementalGenerator: AsyncGenerator<LoaderChunk<MetadataTemplate>, void, void>): Promise<void>;
    /**
     * This TypeScript function asynchronously processes chunks of data, cleans up the content,
     * calculates a content hash, and yields the modified chunks.
     */
    getChunks(): AsyncGenerator<LoaderChunk<MetadataTemplate>, void, void>;
    abstract getUnfilteredChunks(): AsyncGenerator<UnfilteredLoaderChunk<MetadataTemplate>, void, void>;
}
