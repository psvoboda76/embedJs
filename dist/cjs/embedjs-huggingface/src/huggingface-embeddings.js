"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuggingFaceEmbeddings = void 0;
const hf_1 = require("@langchain/community/embeddings/hf");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class HuggingFaceEmbeddings extends embedjs_interfaces_1.BaseEmbeddings {
    model;
    dimensions;
    constructor({ apiKey, model, dimensions }) {
        super();
        this.dimensions = dimensions ?? null;
        this.model = new hf_1.HuggingFaceInferenceEmbeddings({
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
exports.HuggingFaceEmbeddings = HuggingFaceEmbeddings;
//# sourceMappingURL=huggingface-embeddings.js.map