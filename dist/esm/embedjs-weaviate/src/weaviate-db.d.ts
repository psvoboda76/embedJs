import { BaseVectorDatabase, ExtractChunkData, InsertChunkData } from '@llm-tools/embedjs-interfaces';
export declare class WeaviateDb implements BaseVectorDatabase {
    private readonly debug;
    private static readonly WEAVIATE_INSERT_CHUNK_SIZE;
    private dimensions;
    private readonly className;
    private readonly client;
    constructor({ host, apiKey, className, scheme, }: {
        host: string;
        apiKey: string;
        className: string;
        scheme: 'http' | 'https';
    });
    init({ dimensions }: {
        dimensions: number;
    }): Promise<void>;
    insertChunks(chunks: InsertChunkData[]): Promise<number>;
    similaritySearch(query: number[], k: number): Promise<ExtractChunkData[]>;
    getVectorCount(): Promise<number>;
    deleteKeys(uniqueLoaderId: string): Promise<boolean>;
    reset(): Promise<void>;
}
