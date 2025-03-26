"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlLoader = void 0;
const tslib_1 = require("tslib");
const stream_mime_type_1 = require("stream-mime-type");
const debug_1 = tslib_1.__importDefault(require("debug"));
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const mime_js_1 = require("../util/mime.cjs");
class UrlLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:UrlLoader');
    url;
    constructor({ url }) {
        super(`UrlLoader_${(0, md5_1.default)(url)}`, { url: (0, embedjs_utils_1.truncateCenterString)(url, 50) });
        this.url = new URL(url);
        this.debug(`UrlLoader verified '${url}' is a valid URL!`);
    }
    async *getUnfilteredChunks() {
        const response = await (0, embedjs_utils_1.getSafe)(this.url.href, { headers: { 'Accept-Encoding': '' } });
        const stream = response.body;
        let { mime } = await (0, stream_mime_type_1.getMimeType)(stream, { strict: true });
        this.debug(`Loader stream detected type '${mime}'`);
        if (!mime) {
            mime = (0, embedjs_utils_1.contentTypeToMimeType)(response.headers.get('content-type'));
            this.debug(`Using type '${mime}' from content-type header`);
        }
        try {
            const loader = await (0, mime_js_1.createLoaderFromMimeType)(this.url.href, mime);
            for await (const result of await loader.getUnfilteredChunks()) {
                yield {
                    pageContent: result.pageContent,
                    metadata: {
                        type: 'UrlLoader',
                        source: this.url.href,
                    },
                };
            }
        }
        catch (err) {
            this.debug(`Error creating loader for mime type '${mime}'`, err);
        }
    }
}
exports.UrlLoader = UrlLoader;
//# sourceMappingURL=url-loader.js.map