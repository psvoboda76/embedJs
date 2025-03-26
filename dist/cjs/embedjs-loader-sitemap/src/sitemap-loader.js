"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitemapLoader = void 0;
const tslib_1 = require("tslib");
const md5_1 = tslib_1.__importDefault(require("md5"));
const sitemapper_1 = tslib_1.__importDefault(require("sitemapper"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_loader_web_1 = require("@llm-tools/embedjs-loader-web");
class SitemapLoader extends embedjs_interfaces_1.BaseLoader {
    static async test(url) {
        try {
            // @ts-ignore
            await new sitemapper_1.default({ url, timeout: 15000 }).fetch();
            return true;
        }
        catch {
            return false;
        }
    }
    debug = (0, debug_1.default)('embedjs:loader:SitemapLoader');
    url;
    constructor({ url, chunkSize, chunkOverlap }) {
        super(`SitemapLoader_${(0, md5_1.default)(url)}`, { url }, chunkSize ?? 2000, chunkOverlap);
        this.url = url;
    }
    async *getUnfilteredChunks() {
        try {
            // @ts-ignore
            const { sites } = await new sitemapper_1.default({ url: this.url, timeout: 15000 }).fetch();
            this.debug(`Sitemap '${this.url}' returned ${sites.length} URLs`);
            for (const url of sites) {
                const webLoader = new embedjs_loader_web_1.WebLoader({
                    urlOrContent: url,
                    chunkSize: this.chunkSize,
                    chunkOverlap: this.chunkOverlap,
                });
                for await (const chunk of webLoader.getUnfilteredChunks()) {
                    yield {
                        ...chunk,
                        metadata: {
                            ...chunk.metadata,
                            type: 'SitemapLoader',
                            originalSource: this.url,
                        },
                    };
                }
            }
        }
        catch (e) {
            this.debug('Could not get sites from sitemap url', this.url, e);
        }
    }
}
exports.SitemapLoader = SitemapLoader;
//# sourceMappingURL=sitemap-loader.js.map