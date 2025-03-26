import { CreateIndexSpec } from '@pinecone-database/pinecone/dist/control/createIndex.js';
import { BaseVectorDatabase, ExtractChunkData, InsertChunkData } from '@llm-tools/embedjs-interfaces';
export declare class PineconeDb implements BaseVectorDatabase {
    private readonly debug;
    private static readonly PINECONE_INSERT_CHUNK_SIZE;
    private readonly client;
    private readonly namespace;
    private readonly projectName;
    private readonly indexSpec;
    constructor({ projectName, namespace, indexSpec, }: {
        projectName: string;
        namespace: string;
        indexSpec: CreateIndexSpec;
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
