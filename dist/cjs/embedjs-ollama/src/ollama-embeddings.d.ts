import { OllamaInput } from '@langchain/ollama';
import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export declare class OllamaEmbeddings extends BaseEmbeddings {
    private model;
    constructor(options: {
        model: string;
        baseUrl: string;
        /** Defaults to "5m" */
        keepAlive?: string;
        requestOptions?: Omit<OllamaInput, 'baseUrl' | 'model' | 'format' | 'headers'>;
    });
    getDimensions(): Promise<number>;
    embedDocuments(texts: string[]): Promise<number[][]>;
    embedQuery(text: string): Promise<number[]>;
}
