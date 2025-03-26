"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohereEmbeddings = void 0;
const cohere_1 = require("@langchain/cohere");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class CohereEmbeddings extends embedjs_interfaces_1.BaseEmbeddings {
    model;
    constructor() {
        super();
        this.model = new cohere_1.CohereEmbeddings({
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
exports.CohereEmbeddings = CohereEmbeddings;
//# sourceMappingURL=cohere-embeddings.js.map