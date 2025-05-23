import { Pinecone } from '@pinecone-database/pinecone';
import createDebugMessages from 'debug';
export class PineconeDb {
    debug = createDebugMessages('embedjs:vector:PineconeDb');
    static PINECONE_INSERT_CHUNK_SIZE = 200; //Pinecone only allows inserting 2MB worth of chunks at a time; this is an approximation
    client;
    namespace;
    projectName;
    indexSpec;
    constructor({ projectName, namespace, indexSpec, }) {
        if (!process.env.PINECONE_API_KEY)
            throw new Error('PINECONE_API_KEY environment variable must be set!');
        this.client = new Pinecone();
        this.projectName = projectName;
        this.namespace = namespace;
        this.indexSpec = indexSpec;
    }
    async init({ dimensions }) {
        const list = (await this.client.listIndexes()).indexes.map((i) => i.name);
        if (list.indexOf(this.projectName) > -1)
            return;
        await this.client.createIndex({
            name: this.projectName,
            dimension: dimensions,
            metric: 'cosine',
            spec: this.indexSpec,
        });
    }
    async insertChunks(chunks) {
        let processed = 0;
        const index = this.client.Index(this.projectName).namespace(this.namespace);
        for (let i = 0; i < chunks.length; i += PineconeDb.PINECONE_INSERT_CHUNK_SIZE) {
            const chunkBatch = chunks.slice(i, i + PineconeDb.PINECONE_INSERT_CHUNK_SIZE);
            const upsertCommand = chunkBatch.map((chunk) => {
                return {
                    id: chunk.metadata.id,
                    values: chunk.vector,
                    metadata: { pageContent: chunk.pageContent, ...chunk.metadata },
                };
            });
            this.debug(`Inserting Pinecone batch`);
            await index.upsert(upsertCommand);
            processed += chunkBatch.length;
        }
        return processed;
    }
    async similaritySearch(query, k) {
        const index = this.client.Index(this.projectName).namespace(this.namespace);
        const queryResponse = await index.query({
            topK: k,
            vector: query,
            includeMetadata: true,
            includeValues: true,
        });
        return queryResponse.matches.map((match) => {
            const pageContent = match.metadata.pageContent;
            delete match.metadata.pageContent;
            return {
                score: match.score,
                pageContent,
                metadata: match.metadata,
            };
        });
    }
    async getVectorCount() {
        const index = this.client.Index(this.projectName).namespace(this.namespace);
        return (await index.describeIndexStats()).totalRecordCount;
    }
    async deleteKeys(uniqueLoaderId) {
        const index = await this.client.Index(this.projectName).namespace(this.namespace);
        try {
            await index.deleteMany({ uniqueLoaderId: { $eq: uniqueLoaderId } });
            return true;
        }
        catch {
            this.debug(`Failed to delete keys for loader '${uniqueLoaderId}'.
Pinecone does not allow deleting by metadata filtering in serverless and free instances`);
            return false;
        }
    }
    async reset() {
        await this.client.Index(this.projectName).namespace(this.namespace).deleteAll();
    }
}
//# sourceMappingURL=pinecone-db.js.map