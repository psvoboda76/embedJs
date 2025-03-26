import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export declare class HuggingFaceEmbeddings extends BaseEmbeddings {
    private model;
    private dimensions;
    constructor({ apiKey, model, dimensions }: {
        apiKey?: string;
        model?: string;
        dimensions?: number;
    });
    getDimensions(): Promise<number>;
    embedDocuments(texts: string[]): Promise<number[][]>;
    embedQuery(text: string): Promise<number[]>;
}
