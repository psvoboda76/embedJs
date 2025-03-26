import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export declare class GeckoEmbeddings extends BaseEmbeddings {
    private model;
    constructor();
    getDimensions(): Promise<number>;
    embedDocuments(texts: string[]): Promise<number[][]>;
    embedQuery(text: string): Promise<number[]>;
}
