"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureOpenAiEmbeddings = void 0;
const openai_1 = require("@langchain/openai");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class AzureOpenAiEmbeddings extends embedjs_interfaces_1.BaseEmbeddings {
    configuration;
    model;
    constructor(configuration) {
        super();
        this.configuration = configuration;
        if (!this.configuration)
            this.configuration = {};
        if (!this.configuration.model)
            this.configuration.model = 'text-embedding-3-small';
        if (!this.configuration.dimensions) {
            if (this.configuration.model === 'text-embedding-3-small') {
                this.configuration.dimensions = 1536;
            }
            else if (this.configuration.model === 'text-embedding-3-large') {
                this.configuration.dimensions = 3072;
            }
            else if (this.configuration.model === 'text-embedding-ada-002') {
                this.configuration.dimensions = 1536;
            }
            else {
                throw new Error('You need to pass in the optional dimensions parameter for this model');
            }
        }
        this.model = new openai_1.AzureOpenAIEmbeddings(this.configuration);
    }
    async getDimensions() {
        return this.configuration.dimensions;
    }
    async embedDocuments(texts) {
        return this.model.embedDocuments(texts);
    }
    async embedQuery(text) {
        return this.model.embedQuery(text);
    }
}
exports.AzureOpenAiEmbeddings = AzureOpenAiEmbeddings;
//# sourceMappingURL=azure-openai-embeddings.js.map