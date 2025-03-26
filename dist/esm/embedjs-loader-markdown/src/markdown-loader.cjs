"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownLoader = void 0;
const tslib_1 = require("tslib");
const micromark_1 = require("micromark");
const micromark_extension_mdx_jsx_1 = require("micromark-extension-mdx-jsx");
const micromark_extension_gfm_1 = require("micromark-extension-gfm");
const debug_1 = tslib_1.__importDefault(require("debug"));
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
const embedjs_loader_web_1 = require("@llm-tools/embedjs-loader-web");
class MarkdownLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:MarkdownLoader');
    filePathOrUrl;
    isUrl;
    constructor({ filePathOrUrl, chunkOverlap, chunkSize, }) {
        super(`MarkdownLoader_${(0, md5_1.default)(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1000, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = (0, embedjs_utils_1.isValidURL)(filePathOrUrl) ? true : false;
    }
    async *getUnfilteredChunks() {
        const buffer = this.isUrl
            ? (await (0, embedjs_utils_1.getSafe)(this.filePathOrUrl, { format: 'buffer' })).body
            : await (0, embedjs_utils_1.streamToBuffer)(node_fs_1.default.createReadStream(this.filePathOrUrl));
        this.debug('MarkdownLoader stream created');
        const result = (0, micromark_1.micromark)(buffer, { extensions: [(0, micromark_extension_gfm_1.gfm)(), (0, micromark_extension_mdx_jsx_1.mdxJsx)()], htmlExtensions: [(0, micromark_extension_gfm_1.gfmHtml)()] });
        this.debug('Markdown parsed...');
        const webLoader = new embedjs_loader_web_1.WebLoader({
            urlOrContent: result,
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        for await (const result of await webLoader.getUnfilteredChunks()) {
            result.pageContent = result.pageContent.replace(/[\[\]\(\)\{\}]/g, '');
            yield {
                pageContent: result.pageContent,
                metadata: {
                    type: 'MarkdownLoader',
                    source: this.filePathOrUrl,
                },
            };
        }
        this.debug(`MarkdownLoader for filePathOrUrl '${this.filePathOrUrl}' finished`);
    }
}
exports.MarkdownLoader = MarkdownLoader;
//# sourceMappingURL=markdown-loader.js.map