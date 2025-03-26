"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlLoader = void 0;
const tslib_1 = require("tslib");
const fast_xml_parser_1 = require("fast-xml-parser");
const debug_1 = tslib_1.__importDefault(require("debug"));
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
class XmlLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:XmlLoader');
    xmlParseOptions;
    filePathOrUrl;
    isUrl;
    constructor({ filePathOrUrl, xmlParseOptions, chunkOverlap, chunkSize, }) {
        super(`XmlLoader_${(0, md5_1.default)(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1000, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = (0, embedjs_utils_1.isValidURL)(filePathOrUrl) ? true : false;
        this.xmlParseOptions = xmlParseOptions;
    }
    async *getUnfilteredChunks() {
        const buffer = this.isUrl
            ? (await (0, embedjs_utils_1.getSafe)(this.filePathOrUrl, { format: 'buffer' })).body
            : await (0, embedjs_utils_1.streamToBuffer)(node_fs_1.default.createReadStream(this.filePathOrUrl));
        this.debug('XmlLoader stream created');
        const parsed = new fast_xml_parser_1.XMLParser(this.xmlParseOptions).parse(buffer);
        this.debug('XML data parsed');
        const array = Array.isArray(parsed) ? parsed : [parsed];
        for (const entry of array) {
            const str = (0, embedjs_utils_1.cleanString)(JSON.stringify(entry));
            if ('id' in entry) {
                entry.preEmbedId = entry.id;
                delete entry.id;
            }
            yield {
                pageContent: str,
                metadata: {
                    type: 'XmlLoader',
                    source: this.filePathOrUrl,
                },
            };
        }
        this.debug(`XmlLoader for filePathOrUrl '${this.filePathOrUrl}' finished`);
    }
}
exports.XmlLoader = XmlLoader;
//# sourceMappingURL=xml-loader.js.map