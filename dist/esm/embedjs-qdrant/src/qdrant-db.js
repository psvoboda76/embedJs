import { QdrantClient } from '@qdrant/js-client-rest';
import createDebugMessages from 'debug';
import { v4 as uuid } from 'uuid';
export class QdrantDb {
    debug = createDebugMessages('embedjs:vector:QdrantDb');
    static QDRANT_INSERT_CHUNK_SIZE = 500;
    client;
    clusterName;
    constructor({ apiKey, url, clusterName }) {
        this.client = new QdrantClient({ apiKey, url });
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
                    id: uuid(),
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
//# sourceMappingURL=qdrant-db.js.map