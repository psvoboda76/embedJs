"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaviateDb = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const weaviate_ts_client_1 = tslib_1.__importStar(require("weaviate-ts-client"));
const compute_cosine_similarity_1 = tslib_1.__importDefault(require("compute-cosine-similarity"));
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
class WeaviateDb {
    debug = (0, debug_1.default)('embedjs:vector:WeaviateDb');
    static WEAVIATE_INSERT_CHUNK_SIZE = 500;
    dimensions;
    className;
    client;
    constructor({ host, apiKey, className, scheme = 'https', }) {
        // @ts-ignore
        this.client = weaviate_ts_client_1.default.client({ scheme, host, apiKey: new weaviate_ts_client_1.ApiKey(apiKey) });
        this.className = (0, embedjs_utils_1.toTitleCase)(className); // Weaviate translates the className during create to title case and errors at other places
    }
    async init({ dimensions }) {
        this.dimensions = dimensions;
        const { classes: list } = await this.client.schema.getter().do();
        if (list.map((l) => l.class).indexOf(this.className) > -1)
            return;
        await this.client.schema
            .classCreator()
            .withClass({
            class: this.className,
            properties: [
                {
                    name: 'realId',
                    dataType: ['text'],
                },
                {
                    name: 'pageContent',
                    dataType: ['text'],
                },
                {
                    name: 'uniqueLoaderId',
                    dataType: ['text'],
                },
                {
                    name: 'source',
                    dataType: ['text'],
                },
            ],
            vectorIndexConfig: {
                distance: 'cosine',
            },
        })
            .do();
    }
    async insertChunks(chunks) {
        let processed = 0;
        const batcher = this.client.batch.objectsBatcher();
        for (let i = 0; i < chunks.length; i += WeaviateDb.WEAVIATE_INSERT_CHUNK_SIZE) {
            const chunkBatch = chunks.slice(i, i + WeaviateDb.WEAVIATE_INSERT_CHUNK_SIZE);
            this.debug(`Inserting Weaviate batch`);
            const result = await batcher
                .withObjects(...chunkBatch.map((chunk) => {
                const chunkId = chunk.metadata.id;
                delete chunk.metadata.id;
                return {
                    class: this.className,
                    id: (0, weaviate_ts_client_1.generateUuid5)(chunkId),
                    vector: chunk.vector,
                    properties: {
                        uniqueLoaderId: chunk.metadata.uniqueLoaderId,
                        pageContent: chunk.pageContent,
                        ...chunk.metadata,
                    },
                };
            }))
                .do();
            this.debug('Weaviate errors', result.map((r) => r.result?.errors?.error?.[0].message ?? 'NONE'));
            processed += chunkBatch.length;
        }
        return processed;
    }
    async similaritySearch(query, k) {
        const queryResponse = await this.client.graphql
            .get()
            .withClassName(this.className)
            .withNearVector({ vector: query })
            .withFields('uniqueLoaderId pageContent source _additional { vector }')
            .withLimit(k)
            .do();
        return queryResponse.data.Get[this.className].map((match) => {
            const pageContent = match.pageContent;
            delete match.pageContent;
            const vector = match._additional.vector;
            delete match._additional;
            return {
                score: (0, compute_cosine_similarity_1.default)(query, vector),
                pageContent,
                metadata: match,
            };
        });
    }
    async getVectorCount() {
        const queryResponse = await this.client.graphql
            .aggregate()
            .withClassName(this.className)
            .withFields('meta { count }')
            .do();
        return queryResponse.data.Aggregate[this.className][0].meta.count;
    }
    async deleteKeys(uniqueLoaderId) {
        await this.client.batch
            .objectsBatchDeleter()
            .withClassName(this.className)
            .withWhere({
            path: ['uniqueLoaderId'],
            operator: 'ContainsAny',
            valueTextArray: [uniqueLoaderId],
        })
            .do();
        return true;
    }
    async reset() {
        await this.client.schema.classDeleter().withClassName(this.className).do();
        await this.init({ dimensions: this.dimensions });
    }
}
exports.WeaviateDb = WeaviateDb;
//# sourceMappingURL=weaviate-db.js.map