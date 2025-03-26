import HNSWLib from 'hnswlib-node';
import createDebugMessages from 'debug';
export class HNSWDb {
    debug = createDebugMessages('embedjs:vector:HNSWDb');
    index;
    docCount;
    docMap;
    async init({ dimensions }) {
        this.index = await new HNSWLib.HierarchicalNSW('cosine', dimensions);
        this.index.initIndex(0);
        this.docMap = new Map();
        this.docCount = 0;
    }
    async insertChunks(chunks) {
        const needed = this.index.getCurrentCount() + chunks.length;
        this.index.resizeIndex(needed);
        for (const chunk of chunks) {
            this.docCount++;
            this.index.addPoint(chunk.vector, this.docCount);
            this.docMap.set(this.docCount, { pageContent: chunk.pageContent, metadata: chunk.metadata });
        }
        return chunks.length;
    }
    async similaritySearch(query, k) {
        k = Math.min(k, this.index.getCurrentCount());
        const result = this.index.searchKnn(query, k, (label) => this.docMap.has(label));
        return result.neighbors.map((label, index) => {
            return {
                ...this.docMap.get(label),
                score: result.distances[index],
            };
        });
    }
    async getVectorCount() {
        return this.index.getCurrentCount();
    }
    async deleteKeys() {
        this.debug('deleteKeys is not supported by HNSWDb');
        return false;
    }
    async reset() {
        await this.init({ dimensions: this.index.getNumDimensions() });
    }
}
//# sourceMappingURL=hnswlib-db.js.map