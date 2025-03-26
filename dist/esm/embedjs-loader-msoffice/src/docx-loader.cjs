"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxLoader = void 0;
const tslib_1 = require("tslib");
const textsplitters_1 = require("@langchain/textsplitters");
const office_text_extractor_1 = require("office-text-extractor");
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
class DocxLoader extends embedjs_interfaces_1.BaseLoader {
    filePathOrUrl;
    isUrl;
    constructor({ filePathOrUrl, chunkOverlap, chunkSize, }) {
        super(`DocxLoader_${(0, md5_1.default)(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1000, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = (0, embedjs_utils_1.isValidURL)(filePathOrUrl) ? true : false;
    }
    async *getUnfilteredChunks() {
        const chunker = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        const extractor = (0, office_text_extractor_1.getTextExtractor)();
        const docxParsed = await extractor.extractText({
            input: this.filePathOrUrl,
            type: this.isUrl ? 'url' : 'file',
        });
        const chunks = await chunker.splitText((0, embedjs_utils_1.cleanString)(docxParsed));
        for (const chunk of chunks) {
            yield {
                pageContent: chunk,
                metadata: {
                    type: 'DocxLoader',
                    source: this.filePathOrUrl,
                },
            };
        }
    }
}
exports.DocxLoader = DocxLoader;
//# sourceMappingURL=docx-loader.js.map