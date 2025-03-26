"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaEmbeddings = void 0;
const ollama_1 = require("@langchain/ollama");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class OllamaEmbeddings extends embedjs_interfaces_1.BaseEmbeddings {
    model;
    constructor(options) {
        super();
        this.model = new ollama_1.OllamaEmbeddings({
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
exports.OllamaEmbeddings = OllamaEmbeddings;
//# sourceMappingURL=ollama-embeddings.js.map