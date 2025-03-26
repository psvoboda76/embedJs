"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeckoEmbeddings = void 0;
const google_vertexai_1 = require("@langchain/google-vertexai");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class GeckoEmbeddings extends embedjs_interfaces_1.BaseEmbeddings {
    model;
    constructor() {
        super();
        this.model = new google_vertexai_1.VertexAIEmbeddings({ model: 'textembedding-gecko', maxConcurrency: 3, maxRetries: 5 });
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
exports.GeckoEmbeddings = GeckoEmbeddings;
//# sourceMappingURL=gecko-embeddings.js.map