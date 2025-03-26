import { BaseVectorDatabase, InsertChunkData, ExtractChunkData } from '@llm-tools/embedjs-interfaces';
export declare class AstraDb implements BaseVectorDatabase {
    private db;
    private collectionName;
    private collection;
    private dimensions;
    constructor({ endpoint, apiKey, collectionName, namespace, }: {
        endpoint: string;
        apiKey: string;
        namespace?: string;
        collectionName: string;
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
