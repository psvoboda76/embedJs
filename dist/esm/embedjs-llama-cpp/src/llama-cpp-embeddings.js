import { BaseEmbeddings } from '@llm-tools/embedjs-interfaces';
import { getLlama } from 'node-llama-cpp';
export class LlamaCppEmbeddings extends BaseEmbeddings {
    modelPath;
    context;
    constructor({ modelPath }) {
        super();
        this.modelPath = modelPath;
    }
    async init() {
        await getLlama().then((llama) => {
            llama.loadModel({ modelPath: this.modelPath }).then((model) => {
                model.createEmbeddingContext().then((context) => {
                    this.context = context;
                });
            });
        });
    }
    async getDimensions() {
        const sample = await this.embedDocuments(['sample']);
        return sample[0].length;
    }
    async embedDocuments(texts) {
        const embeddings = new Map();
        await Promise.all(texts.map(async (document) => {
            const embedding = await this.context.getEmbeddingFor(document);
            embeddings.set(document, embedding);
        }));
        return Array.from(embeddings).map(([_, embedding]) => embedding.vector);
    }
    async embedQuery(text) {
        return (await this.context.getEmbeddingFor(text)).vector;
    }
}
//# sourceMappingURL=llama-cpp-embeddings.js.map