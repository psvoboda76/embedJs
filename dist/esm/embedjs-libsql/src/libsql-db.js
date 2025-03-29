import createDebugMessages from 'debug';
import { createClient } from '@libsql/client';
import { truncateCenterString } from '@llm-tools/embedjs-utils';
export class LibSqlDb {
    debug = createDebugMessages('embedjs:vector:LibSqlDb');
    tableName;
    client;
    constructor({ path, tableName }) {
        this.tableName = tableName ?? 'vectors';
        this.client = createClient({
            url: `file:${path}`,
        });
    }
    async init({ dimensions }) {
        await this.client.execute(`CREATE TABLE IF NOT EXISTS ${this.tableName} (
            id              TEXT PRIMARY KEY,
            pageContent     TEXT UNIQUE,
            uniqueLoaderId  TEXT NOT NULL,
            source          TEXT NOT NULL,
            vector          F32_BLOB(${dimensions}),
            metadata        TEXT
        );`);
    }
    async insertChunks(chunks) {
        const batch = chunks.map((chunk) => {
            return {
                sql: `INSERT OR IGNORE INTO ${this.tableName} (id, pageContent, uniqueLoaderId, source, vector, metadata)
            VALUES (?, ?, ?, ?, vector32('[${chunk.vector.join(',')}]'), ?);`,
                args: [
                    chunk.metadata.id,
                    chunk.pageContent,
                    chunk.metadata.uniqueLoaderId,
                    chunk.metadata.source,
                    JSON.stringify(chunk.metadata),
                ],
            };
        });
        this.debug(`Executing batch - ${truncateCenterString(JSON.stringify(batch), 1000)}`);
        const result = await this.client.batch(batch, 'write');
        return result.reduce((a, b) => a + b.rowsAffected, 0);
    }
    async similaritySearch(query, k, docLimit) {
        let statement = `SELECT id, pageContent, uniqueLoaderId, source, metadata,
                vector_distance_cos(vector, vector32('[${query.join(',')}]')) as distance
            FROM ${this.tableName}
            ORDER BY vector_distance_cos(vector, vector32('[${query.join(',')}]')) ASC
            LIMIT ${k};`;
        if (docLimit) {
            statement = `
    WITH ranked_results AS (
        SELECT id, pageContent, uniqueLoaderId, source, metadata,
               vector_distance_cos(vector, vector32('[${query.join(',')}]')) as distance,
               (SELECT COUNT(*) 
                FROM ${this.tableName} AS sub 
                WHERE sub.uniqueLoaderId = main.uniqueLoaderId 
                AND sub.id <= main.id) AS row_num
        FROM ${this.tableName} AS main
        ORDER BY distance ASC
    )
    SELECT id, pageContent, uniqueLoaderId, source, metadata, distance
    FROM ranked_results
    WHERE row_num <= ${docLimit}
    ORDER BY distance ASC
    LIMIT ${k};
`;
        }
        this.debug(`Executing statement - ${truncateCenterString(statement, 700)}`);
        const results = await this.client.execute(statement);
        return results.rows.map((result) => {
            const metadata = JSON.parse(result.metadata.toString());
            return {
                metadata,
                pageContent: result.pageContent.toString(),
                score: 1 - result.distance,
            };
        });
    }
    async getVectorCount() {
        const statement = `SELECT count(id) as count FROM ${this.tableName};`;
        this.debug(`Executing statement - ${statement}`);
        const results = await this.client.execute(statement);
        return Number.parseInt(results.rows[0].count.toString());
    }
    async deleteKeys(uniqueLoaderId) {
        await this.client.execute(`DELETE FROM ${this.tableName} WHERE
           uniqueLoaderId = '${uniqueLoaderId}';`);
        return true;
    }
    async reset() {
        await this.client.execute(`DELETE FROM ${this.tableName};`);
    }
}
//# sourceMappingURL=libsql-db.js.map