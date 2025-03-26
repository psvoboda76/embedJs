import { OllamaEmbeddings as OllamaEmbedding } from '@langchain/ollama';
import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export class OllamaEmbeddings extends BaseEmbeddings {
    model;
    constructor(options) {
        super();
        this.model = new OllamaEmbedding({
            model: options.model,
            baseUrl: options.baseUrl,
            keepAlive: options?.keepAlive,
            requestOptions: options?.requestOptions,
        });
    }
    async getDimensions() {
        const sample = await this.model.embedDocuments(['sample']);
        return sample[0].length;
    }
    async embedDocuments(texts) {
        return this.model.embedDocuments(texts);
    }
    async embedQuery(text) {
        return this.model.embedQuery(text);
    }
}
//# sourceMappingURL=ollama-embeddings.js.map