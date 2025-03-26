import { DataAPIClient } from '@datastax/astra-db-ts';
export class AstraDb {
    db;
    collectionName;
    collection;
    dimensions;
    constructor({ endpoint, apiKey, collectionName, namespace = 'default_keyspace', }) {
        const client = new DataAPIClient(apiKey);
        this.db = client.db(endpoint, { namespace });
        this.collectionName = collectionName;
    }
    async init({ dimensions }) {
        this.dimensions = dimensions;
        this.collection = await this.db.createCollection(this.collectionName, {
            vector: { dimension: dimensions, metric: 'cosine' },
            checkExists: false,
        });
    }
    async insertChunks(chunks) {
        const result = await this.collection.insertMany(chunks.map((chunk) => ({
            $vector: chunk.vector,
            metadata: chunk.metadata,
            pageContent: chunk.pageContent,
        })));
        return result.insertedCount;
    }
    async similaritySearch(query, k) {
        const cursor = this.collection.find({}, { sort: { $vector: query }, limit: k, includeSimilarity: true });
        const results = await cursor.toArray();
        return results.map((result) => ({
            score: result.similarity,
            pageContent: result.pageContent,
            metadata: result.metadata,
        }));
    }
    async getVectorCount() {
        // This gives a very rough estimate of the number of documents in the collection. It is not guaranteed to be accurate, and should not be used as a source of truth for the number of documents in the collection.
        return this.collection.estimatedDocumentCount();
    }
    async deleteKeys(uniqueLoaderId) {
        const result = await this.collection.deleteMany({ 'metadata.uniqueLoaderId': uniqueLoaderId });
        return result.deletedCount > 0;
    }
    async reset() {
        await this.collection.drop();
        await this.init({ dimensions: this.dimensions });
    }
}
//# sourceMappingURL=astra-db.js.map