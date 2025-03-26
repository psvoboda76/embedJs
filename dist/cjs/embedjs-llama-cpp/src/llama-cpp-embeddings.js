"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlamaCppEmbeddings = void 0;
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const node_llama_cpp_1 = require("node-llama-cpp");
class LlamaCppEmbeddings extends embedjs_interfaces_1.BaseEmbeddings {
    modelPath;
    context;
    constructor({ modelPath }) {
        super();
        this.modelPath = modelPath;
    }
    async init() {
        await (0, node_llama_cpp_1.getLlama)().then((llama) => {
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
exports.LlamaCppEmbeddings = LlamaCppEmbeddings;
//# sourceMappingURL=llama-cpp-embeddings.js.map