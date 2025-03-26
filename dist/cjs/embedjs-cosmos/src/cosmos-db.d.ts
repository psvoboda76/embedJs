import { CosmosClientOptions } from '@azure/cosmos';
import { BaseVectorDatabase, ExtractChunkData, InsertChunkData } from '@llm-tools/embedjs-interfaces';
export declare class CosmosDb implements BaseVectorDatabase {
    private readonly debug;
    private static readonly DEFAULT_DB_NAME;
    private static readonly CONTAINER_NAME;
    private static readonly VECTOR_FIELD_NAME;
    private static readonly LOADER_FIELD_NAME;
    private readonly client;
    private readonly dbName;
    private container;
    private readonly containerName;
    constructor({ dbName, containerName, cosmosClientOptions, }: {
        dbName?: string;
        containerName?: string;
        cosmosClientOptions: CosmosClientOptions;
    });
    init({ dimensions }: {
        dimensions: number;
    }): Promise<void>;
    insertChunks(chunks: InsertChunkData[]): Promise<number>;
    similaritySearch(query: number[], k: number): Promise<ExtractChunkData[]>;
    getVectorCount(): Promise<number>;
    private bulkDeleteValues;
    private bulkDeleteValuesByBatch;
    deleteKeys(uniqueLoaderId: string): Promise<boolean>;
    reset(): Promise<void>;
}
