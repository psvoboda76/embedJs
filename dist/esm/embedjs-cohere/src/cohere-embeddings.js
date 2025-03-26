import { CohereEmbeddings as LangChainCohereEmbeddings } from '@langchain/cohere';
import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export class CohereEmbeddings extends BaseEmbeddings {
    model;
    constructor() {
        super();
        this.model = new LangChainCohereEmbeddings({
            model: 'embed-english-v2.0',
            maxConcurrency: 3,
            maxRetries: 5,
        });
    }
    async getDimensions() {
        return 4096;
    }
    async embedDocuments(texts) {
        return this.model.embedDocuments(texts);
    }
    async embedQuery(text) {
        return this.model.embedQuery(text);
    }
}
//# sourceMappingURL=cohere-embeddings.js.map