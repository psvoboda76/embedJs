"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvLoader = void 0;
const tslib_1 = require("tslib");
const csv_parse_1 = require("csv-parse");
const debug_1 = tslib_1.__importDefault(require("debug"));
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
class CsvLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:CsvLoader');
    csvParseOptions;
    filePathOrUrl;
    isUrl;
    constructor({ filePathOrUrl, csvParseOptions, chunkOverlap, chunkSize, }) {
        super(`CsvLoader_${(0, md5_1.default)(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1000, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = (0, embedjs_utils_1.isValidURL)(filePathOrUrl) ? true : false;
        this.csvParseOptions = csvParseOptions ?? { autoParse: true };
    }
    async *getUnfilteredChunks() {
        const buffer = this.isUrl
            ? (await (0, embedjs_utils_1.getSafe)(this.filePathOrUrl, { format: 'buffer' })).body
            : await (0, embedjs_utils_1.streamToBuffer)(node_fs_1.default.createReadStream(this.filePathOrUrl));
        this.debug('CsvParser stream created');
        const parser = (0, csv_parse_1.parse)(buffer, this.csvParseOptions);
        this.debug('CSV parsing started...');
        for await (const record of parser) {
            yield {
                pageContent: (0, embedjs_utils_1.cleanString)(record.join(',')),
                metadata: {
                    type: 'CsvLoader',
                    source: this.filePathOrUrl,
                },
            };
        }
        this.debug(`CsvParser for filePathOrUrl '${this.filePathOrUrl}' finished`);
    }
}
exports.CsvLoader = CsvLoader;
//# sourceMappingURL=csv-loader.js.map