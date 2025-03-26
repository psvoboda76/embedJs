import { BaseVectorDatabase, ExtractChunkData, InsertChunkData } from '@llm-tools/embedjs-interfaces';
export declare class HNSWDb implements BaseVectorDatabase {
    private readonly debug;
    private index;
    private docCount;
    private docMap;
    init({ dimensions }: {
        dimensions: number;
    }): Promise<void>;
    insertChunks(chunks: InsertChunkData[]): Promise<number>;
    similaritySearch(query: number[], k: number): Promise<ExtractChunkData[]>;
    getVectorCount(): Promise<number>;
    deleteKeys(): Promise<boolean>;
    reset(): Promise<void>;
}
