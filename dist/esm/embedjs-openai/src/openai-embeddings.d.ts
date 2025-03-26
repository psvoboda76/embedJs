import { OpenAIEmbeddings } from '@langchain/openai';
import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export declare class OpenAiEmbeddings extends BaseEmbeddings {
    private readonly configuration?;
    private model;
    constructor(configuration?: ConstructorParameters<typeof OpenAIEmbeddings>[0]);
    getDimensions(): Promise<number>;
    embedDocuments(texts: string[]): Promise<number[][]>;
    embedQuery(text: string): Promise<number[]>;
}
