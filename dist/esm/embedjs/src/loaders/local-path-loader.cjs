"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalPathLoader = void 0;
const tslib_1 = require("tslib");
const stream_mime_type_1 = require("stream-mime-type");
const debug_1 = tslib_1.__importDefault(require("debug"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const md5_1 = tslib_1.__importDefault(require("md5"));
const mime_js_1 = require("../util/mime.cjs");
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
class LocalPathLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:LocalPathLoader');
    path;
    constructor({ path }) {
        super(`LocalPathLoader_${(0, md5_1.default)(path)}`, { path });
        this.path = path;
    }
    async *getUnfilteredChunks() {
        for await (const result of await this.recursivelyAddPath(this.path)) {
            yield {
                ...result,
                metadata: {
                    ...result.metadata,
                    type: 'LocalPathLoader',
                    originalPath: this.path,
                },
            };
        }
    }
    async *recursivelyAddPath(currentPath) {
        const isDir = node_fs_1.default.lstatSync(currentPath).isDirectory();
        this.debug(`Processing path '${currentPath}'. It is a ${isDir ? 'Directory!' : 'file...'}`);
        if (!isDir) {
            const stream = node_fs_1.default.createReadStream(currentPath);
            let { mime } = await (0, stream_mime_type_1.getMimeType)(stream);
            stream.destroy();
            this.debug(`File '${this.path}' has mime type '${mime}'`);
            if (mime === 'application/octet-stream') {
                const extension = currentPath.split('.').pop().toLowerCase();
                if (extension === 'md' || extension === 'mdx')
                    mime = 'text/markdown';
                this.debug(`File '${this.path}' mime type updated to 'text/markdown'`);
            }
            try {
                const loader = await (0, mime_js_1.createLoaderFromMimeType)(currentPath, mime);
                for await (const result of await loader.getUnfilteredChunks()) {
                    yield {
                        pageContent: result.pageContent,
                        metadata: {
                            source: currentPath,
                        },
                    };
                }
            }
            catch (err) {
                this.debug(`Error creating loader for mime type '${mime}'`, err);
            }
        }
        else {
            const files = node_fs_1.default.readdirSync(currentPath);
            this.debug(`Dir '${currentPath}' has ${files.length} entries inside`, files);
            for (const file of files) {
                for await (const result of await this.recursivelyAddPath(node_path_1.default.resolve(currentPath, file))) {
                    yield result;
                }
            }
        }
    }
}
exports.LocalPathLoader = LocalPathLoader;
//# sourceMappingURL=local-path-loader.js.map