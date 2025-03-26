import { BaseVectorDatabase, ExtractChunkData, InsertChunkData } from '@llm-tools/embedjs-interfaces';
export declare class QdrantDb implements BaseVectorDatabase {
    private readonly debug;
    private static readonly QDRANT_INSERT_CHUNK_SIZE;
    private readonly client;
    private readonly clusterName;
    constructor({ apiKey, url, clusterName }: {
        apiKey: string;
        url: string;
        clusterName: string;
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
