import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export class GeckoEmbeddings extends BaseEmbeddings {
    model;
    constructor() {
        super();
        this.model = new VertexAIEmbeddings({ model: 'textembedding-gecko', maxConcurrency: 3, maxRetries: 5 });
    }
    async getDimensions() {
        return 768;
    }
    async embedDocuments(texts) {
        return this.model.embedDocuments(texts);
    }
    async embedQuery(text) {
        return this.model.embedQuery(text);
    }
}
//# sourceMappingURL=gecko-embeddings.js.map