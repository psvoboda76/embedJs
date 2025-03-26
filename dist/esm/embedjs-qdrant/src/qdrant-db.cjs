"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantDb = void 0;
const tslib_1 = require("tslib");
const js_client_rest_1 = require("@qdrant/js-client-rest");
const debug_1 = tslib_1.__importDefault(require("debug"));
const uuid_1 = require("uuid");
class QdrantDb {
    debug = (0, debug_1.default)('embedjs:vector:QdrantDb');
    static QDRANT_INSERT_CHUNK_SIZE = 500;
    client;
    clusterName;
    constructor({ apiKey, url, clusterName }) {
        this.client = new js_client_rest_1.QdrantClient({ apiKey, url });
        this.clusterName = clusterName;
    }
    async init({ dimensions }) {
        const list = (await this.client.getCollections()).collections.map((c) => c.name);
        if (list.indexOf(this.clusterName) > -1)
            return;
        await this.client.createCollection(this.clusterName, {
            vectors: {
                size: dimensions,
                distance: 'Cosine',
            },
        });
        await this.client.createPayloadIndex(this.clusterName, {
            wait: true,
            field_name: 'uniqueLoaderId',
            field_schema: 'text',
            ordering: 'weak',
        });
    }
    async insertChunks(chunks) {
        let processed = 0;
        for (let i = 0; i < chunks.length; i += QdrantDb.QDRANT_INSERT_CHUNK_SIZE) {
            const chunkBatch = chunks.slice(i, i + QdrantDb.QDRANT_INSERT_CHUNK_SIZE);
            const upsertCommand = chunkBatch.map((chunk) => {
                return {
                    id: (0, uuid_1.v4)(),
                    vector: chunk.vector,
                    payload: { pageContent: chunk.pageContent, ...chunk.metadata },
                };
            });
            this.debug(`Inserting QDrant batch`);
            await this.client.upsert(this.clusterName, {
                wait: true,
                points: upsertCommand,
            });
            processed += chunkBatch.length;
        }
        return processed;
    }
    async similaritySearch(query, k) {
        const queryResponse = await this.client.search(this.clusterName, {
            limit: k,
            vector: query,
            with_payload: true,
        });
        return queryResponse.map((match) => {
            const pageContent = match.payload.pageContent;
            delete match.payload.pageContent;
            return {
                score: match.score,
                pageContent,
                metadata: match.payload,
            };
        });
    }
    async getVectorCount() {
        return (await this.client.getCollection(this.clusterName)).points_count;
    }
    async deleteKeys(uniqueLoaderId) {
        await this.client.delete(this.clusterName, {
            wait: true,
            filter: {
                must: [
                    {
                        key: 'uniqueLoaderId',
                        match: {
                            value: uniqueLoaderId,
                        },
                    },
                ],
            },
        });
        return true;
    }
    async reset() {
        await this.client.delete(this.clusterName, {
            filter: {},
        });
    }
}
exports.QdrantDb = QdrantDb;
//# sourceMappingURL=qdrant-db.js.map