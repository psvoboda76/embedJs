import * as fsOld from 'node:fs';
import * as fs from 'node:fs/promises';
import createDebugMessages from 'debug';
import similarity from 'compute-cosine-similarity';
import { connect } from '@lancedb/lancedb';
export class LanceDb {
    debug = createDebugMessages('embedjs:vector:LanceDb');
    static STATIC_DB_NAME = 'vectors';
    isTemp = true;
    path;
    table;
    constructor({ path, isTemp }) {
        this.isTemp = isTemp !== undefined ? isTemp : false;
        this.path = path;
    }
    async init({ dimensions }) {
        if (!this.isTemp && !fsOld.existsSync(this.path)) {
            this.debug(`Creating dir at path - ${this.path}`);
            await fs.mkdir(this.path);
        }
        const dir = await (this.isTemp ? fs.mkdtemp(this.path) : this.path);
        this.debug(`Connecting to database at path - ${dir}`);
        const client = await connect(dir);
        this.debug('Trying to connect to table');
        this.table = await client.createTable(LanceDb.STATIC_DB_NAME, [
            //TODO: You can add a proper schema instead of a sample record now but it requires another package apache-arrow; another install on downstream as well
            {
                id: 'md5',
                pageContent: 'sample',
                vector: Array(dimensions),
                uniqueLoaderId: 'sample',
                vectorString: 'sample',
                metadata: 'sample',
            },
        ], { existOk: true });
        this.debug('Connected to table');
    }
    async insertChunks(chunks) {
        const mapped = chunks.map((chunk) => {
            const uniqueLoaderId = chunk.metadata.uniqueLoaderId;
            delete chunk.metadata.uniqueLoaderId;
            return {
                id: chunk.metadata.id,
                pageContent: chunk.pageContent,
                vector: chunk.vector,
                uniqueLoaderId,
                metadata: JSON.stringify(chunk.metadata),
                vectorString: JSON.stringify(chunk.vector),
            };
        });
        this.debug(`Executing insert of ${mapped.length} entries`);
        await this.table.add(mapped);
        return mapped.length; //TODO: check if vectorDb has addressed the issue where add returns undefined
    }
    async similaritySearch(query, k) {
        const results = await this.table.search(query).limit(k).toArray();
        this.debug(`Query found ${results.length} entries`);
        return (results
            //TODO: a mandatory record is used and this record is also returned in results; we filter it out
            .filter((entry) => entry.id !== 'md5')
            .map((result) => {
            const metadata = JSON.parse(result.metadata);
            const vector = JSON.parse(result.vectorString);
            metadata.uniqueLoaderId = result.uniqueLoaderId;
            return {
                score: similarity(query, vector),
                pageContent: result.pageContent,
                metadata,
            };
        }));
    }
    async getVectorCount() {
        return this.table.countRows();
    }
    async deleteKeys(uniqueLoaderId) {
        await this.table.delete(`\`uniqueLoaderId\` = "${uniqueLoaderId}"`);
        return true;
    }
    async reset() {
        await this.table.delete('id IS NOT NULL');
    }
}
//# sourceMappingURL=lance-db.js.map