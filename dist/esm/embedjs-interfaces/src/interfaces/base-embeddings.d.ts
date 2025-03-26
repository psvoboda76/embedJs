export declare abstract class BaseEmbeddings {
    init(): Promise<void>;
    abstract embedDocuments(texts: string[]): Promise<number[][]>;
    abstract embedQuery(text: string): Promise<number[]>;
    abstract getDimensions(): Promise<number>;
}
