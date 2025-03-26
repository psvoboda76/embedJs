"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebLoader = void 0;
const tslib_1 = require("tslib");
const textsplitters_1 = require("@langchain/textsplitters");
const debug_1 = tslib_1.__importDefault(require("debug"));
const html_to_text_1 = require("html-to-text");
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
class WebLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:WebLoader');
    urlOrContent;
    isUrl;
    constructor({ urlOrContent, chunkSize, chunkOverlap, }) {
        super(`WebLoader_${(0, md5_1.default)(urlOrContent)}`, { urlOrContent }, chunkSize ?? 2000, chunkOverlap ?? 0);
        this.isUrl = (0, embedjs_utils_1.isValidURL)(urlOrContent) ? true : false;
        this.urlOrContent = urlOrContent;
    }
    async *getUnfilteredChunks() {
        const chunker = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        try {
            const data = this.isUrl ? (await (0, embedjs_utils_1.getSafe)(this.urlOrContent, { format: 'text' })).body : this.urlOrContent;
            const text = (0, html_to_text_1.convert)(data, {
                wordwrap: false,
                preserveNewlines: false,
            }).replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
            const tuncatedObjectString = this.isUrl ? undefined : (0, embedjs_utils_1.truncateCenterString)(this.urlOrContent, 50);
            const chunks = await chunker.splitText((0, embedjs_utils_1.cleanString)(text));
            for (const chunk of chunks) {
                yield {
                    pageContent: chunk,
                    metadata: {
                        type: 'WebLoader',
                        source: this.isUrl ? this.urlOrContent : tuncatedObjectString,
                    },
                };
            }
        }
        catch (e) {
            this.debug('Could not parse input', this.urlOrContent, e);
        }
    }
}
exports.WebLoader = WebLoader;
//# sourceMappingURL=web-loader.js.map