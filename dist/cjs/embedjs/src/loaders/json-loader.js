"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonLoader = void 0;
const tslib_1 = require("tslib");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
const md5_1 = tslib_1.__importDefault(require("md5"));
class JsonLoader extends embedjs_interfaces_1.BaseLoader {
    object;
    pickKeysForEmbedding;
    constructor({ object, pickKeysForEmbedding, }) {
        super(`JsonLoader_${(0, md5_1.default)((0, embedjs_utils_1.cleanString)(JSON.stringify(object)))}`, {
            object: (0, embedjs_utils_1.truncateCenterString)(JSON.stringify(object), 50),
        });
        this.pickKeysForEmbedding = pickKeysForEmbedding;
        this.object = object;
    }
    async *getUnfilteredChunks() {
        const tuncatedObjectString = (0, embedjs_utils_1.truncateCenterString)(JSON.stringify(this.object), 50);
        const array = Array.isArray(this.object) ? this.object : [this.object];
        for (const entry of array) {
            let s;
            if (this.pickKeysForEmbedding) {
                const subset = Object.fromEntries(this.pickKeysForEmbedding
                    .filter((key) => key in entry) // line can be removed to make it inclusive
                    .map((key) => [key, entry[key]]));
                s = (0, embedjs_utils_1.cleanString)(JSON.stringify(subset));
            }
            else {
                s = (0, embedjs_utils_1.cleanString)(JSON.stringify(entry));
            }
            if ('id' in entry) {
                entry.preEmbedId = entry.id;
                delete entry.id;
            }
            yield {
                pageContent: s,
                metadata: {
                    type: 'JsonLoader',
                    source: tuncatedObjectString,
                },
            };
        }
    }
}
exports.JsonLoader = JsonLoader;
//# sourceMappingURL=json-loader.js.map