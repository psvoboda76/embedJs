import { AzureOpenAIEmbeddings as LangchainAzureOpenAiEmbeddings } from '@langchain/openai';
import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export class AzureOpenAiEmbeddings extends BaseEmbeddings {
    configuration;
    model;
    constructor(configuration) {
        super();
        this.configuration = configuration;
        if (!this.configuration)
            this.configuration = {};
        if (!this.configuration.model)
            this.configuration.model = 'text-embedding-3-small';
        if (!this.configuration.dimensions) {
            if (this.configuration.model === 'text-embedding-3-small') {
                this.configuration.dimensions = 1536;
            }
            else if (this.configuration.model === 'text-embedding-3-large') {
                this.configuration.dimensions = 3072;
            }
            else if (this.configuration.model === 'text-embedding-ada-002') {
                this.configuration.dimensions = 1536;
            }
            else {
                throw new Error('You need to pass in the optional dimensions parameter for this model');
            }
        }
        this.model = new LangchainAzureOpenAiEmbeddings(this.configuration);
    }
    async getDimensions() {
        return this.configuration.dimensions;
    }
    async embedDocuments(texts) {
        return this.model.embedDocuments(texts);
    }
    async embedQuery(text) {
        return this.model.embedQuery(text);
    }
}
//# sourceMappingURL=azure-openai-embeddings.js.map