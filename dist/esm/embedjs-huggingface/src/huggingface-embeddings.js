import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
export class HuggingFaceEmbeddings extends BaseEmbeddings {
    model;
    dimensions;
    constructor({ apiKey, model, dimensions }) {
        super();
        this.dimensions = dimensions ?? null;
        this.model = new HuggingFaceInferenceEmbeddings({
            apiKey, //Or set process.env.HUGGINGFACEHUB_API_KEY
            model,
        });
    }
    async getDimensions() {
        if (this.dimensions === null) {
            this.dimensions = (await this.embedQuery('Test')).length;
        }
        return this.dimensions;
    }
    async embedDocuments(texts) {
        return this.model.embedDocuments(texts);
    }
    async embedQuery(text) {
        return this.model.embedQuery(text);
    }
}
//# sourceMappingURL=huggingface-embeddings.js.map