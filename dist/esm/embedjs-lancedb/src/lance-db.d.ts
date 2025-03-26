import { BaseVectorDatabase, ExtractChunkData, InsertChunkData } from '@llm-tools/embedjs-interfaces';
export declare class LanceDb implements BaseVectorDatabase {
    private readonly debug;
    private static readonly STATIC_DB_NAME;
    private readonly isTemp;
    private readonly path;
    private table;
    constructor({ path, isTemp }: {
        path: string;
        isTemp?: boolean;
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
