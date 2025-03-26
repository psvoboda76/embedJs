import { getMimeType } from 'stream-mime-type';
import createDebugMessages from 'debug';
import path from 'node:path';
import fs from 'node:fs';
import md5 from 'md5';
import { createLoaderFromMimeType } from '../util/mime.js';
import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export class LocalPathLoader extends BaseLoader {
    debug = createDebugMessages('embedjs:loader:LocalPathLoader');
    path;
    constructor({ path }) {
        super(`LocalPathLoader_${md5(path)}`, { path });
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
        const isDir = fs.lstatSync(currentPath).isDirectory();
        this.debug(`Processing path '${currentPath}'. It is a ${isDir ? 'Directory!' : 'file...'}`);
        if (!isDir) {
            const stream = fs.createReadStream(currentPath);
            let { mime } = await getMimeType(stream);
            stream.destroy();
            this.debug(`File '${this.path}' has mime type '${mime}'`);
            if (mime === 'application/octet-stream') {
                const extension = currentPath.split('.').pop().toLowerCase();
                if (extension === 'md' || extension === 'mdx')
                    mime = 'text/markdown';
                this.debug(`File '${this.path}' mime type updated to 'text/markdown'`);
            }
            try {
                const loader = await createLoaderFromMimeType(currentPath, mime);
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
            const files = fs.readdirSync(currentPath);
            this.debug(`Dir '${currentPath}' has ${files.length} entries inside`, files);
            for (const file of files) {
                for await (const result of await this.recursivelyAddPath(path.resolve(currentPath, file))) {
                    yield result;
                }
            }
        }
    }
}
//# sourceMappingURL=local-path-loader.js.map