"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextLoader = void 0;
exports.returnTagID = returnTagID;
const tslib_1 = require("tslib");
const textsplitters_1 = require("@langchain/textsplitters");
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
function returnTagID(fullStr, strLen) {
    let parts = fullStr.split(' ');
    if (parts.length > 1) {
        return parts[0];
    }
    else {
        if (fullStr.length <= strLen)
            return fullStr;
        //SVOBODA
        return fullStr.substring(0, strLen);
    }
}
class TextLoader extends embedjs_interfaces_1.BaseLoader {
    text;
    constructor({ text, chunkSize, chunkOverlap, middleId, }) {
        if (middleId) {
            let id = `TextLoader_${middleId}_${(0, md5_1.default)(text)}`;
            super(id, { text: returnTagID(text, 50) }, chunkSize ?? 300, chunkOverlap ?? 0);
        }
        else {
            let id = `TextLoader_${(0, md5_1.default)(text)}`;
            super(id, { text: (0, embedjs_utils_1.truncateCenterString)(text, 50) }, chunkSize ?? 300, chunkOverlap ?? 0);
        }
        this.text = text;
    }
    async *getUnfilteredChunks() {
        let tuncatedObjectString;
        if (this.uniqueId.split('_').length > 1) {
            tuncatedObjectString = returnTagID(this.text, 50);
        }
        else {
            tuncatedObjectString = (0, embedjs_utils_1.truncateCenterString)(this.text, 50);
        }
        const chunker = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        const chunks = await chunker.splitText((0, embedjs_utils_1.cleanString)(this.text));
        for (const chunk of chunks) {
            yield {
                pageContent: chunk,
                metadata: {
                    type: 'TextLoader',
                    source: tuncatedObjectString,
                    textId: this.uniqueId,
                },
            };
        }
    }
}
exports.TextLoader = TextLoader;
//# sourceMappingURL=text-loader.js.map