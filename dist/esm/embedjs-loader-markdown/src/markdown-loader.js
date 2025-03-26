import { micromark } from 'micromark';
import { mdxJsx } from 'micromark-extension-mdx-jsx';
import { gfmHtml, gfm } from 'micromark-extension-gfm';
import createDebugMessages from 'debug';
import fs from 'node:fs';
import md5 from 'md5';
import { BaseLoader } from '@llm-tools/embedjs-interfaces';
import { getSafe, isValidURL, streamToBuffer } from '@llm-tools/embedjs-utils';
import { WebLoader } from '@llm-tools/embedjs-loader-web';
export class MarkdownLoader extends BaseLoader {
    debug = createDebugMessages('embedjs:loader:MarkdownLoader');
    filePathOrUrl;
    isUrl;
    constructor({ filePathOrUrl, chunkOverlap, chunkSize, }) {
        super(`MarkdownLoader_${md5(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1000, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
    }
    async *getUnfilteredChunks() {
        const buffer = this.isUrl
            ? (await getSafe(this.filePathOrUrl, { format: 'buffer' })).body
            : await streamToBuffer(fs.createReadStream(this.filePathOrUrl));
        this.debug('MarkdownLoader stream created');
        const result = micromark(buffer, { extensions: [gfm(), mdxJsx()], htmlExtensions: [gfmHtml()] });
        this.debug('Markdown parsed...');
        const webLoader = new WebLoader({
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
//# sourceMappingURL=markdown-loader.js.map