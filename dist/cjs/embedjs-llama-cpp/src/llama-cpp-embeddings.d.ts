import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export declare class LlamaCppEmbeddings extends BaseEmbeddings {
    private readonly modelPath;
    private context;
    constructor({ modelPath }: {
        modelPath: string;
    });
    init(): Promise<void>;
    getDimensions(): Promise<number>;
    embedDocuments(texts: string[]): Promise<number[][]>;
    embedQuery(text: string): Promise<number[]>;
}
