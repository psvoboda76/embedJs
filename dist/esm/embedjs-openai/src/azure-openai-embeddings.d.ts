import { AzureOpenAIEmbeddings as LangchainAzureOpenAiEmbeddings } from '@langchain/openai';
import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export declare class AzureOpenAiEmbeddings extends BaseEmbeddings {
    private readonly configuration?;
    private model;
    constructor(configuration?: ConstructorParameters<typeof LangchainAzureOpenAiEmbeddings>[0]);
    getDimensions(): Promise<number>;
    embedDocuments(texts: string[]): Promise<number[][]>;
    embedQuery(text: string): Promise<number[]>;
}
