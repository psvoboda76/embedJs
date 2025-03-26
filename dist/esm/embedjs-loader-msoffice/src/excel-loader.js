import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { getTextExtractor } from 'office-text-extractor';
import md5 from 'md5';
import { BaseLoader } from '@llm-tools/embedjs-interfaces';
import { isValidURL, cleanString } from '@llm-tools/embedjs-utils';
export class ExcelLoader extends BaseLoader {
    filePathOrUrl;
    isUrl;
    constructor({ filePathOrUrl, chunkOverlap, chunkSize, }) {
        super(`ExcelLoader_${md5(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1000, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
    }
    async *getUnfilteredChunks() {
        const chunker = new RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        const extractor = getTextExtractor();
        const xlsxParsed = await extractor.extractText({
            input: this.filePathOrUrl,
            type: this.isUrl ? 'url' : 'file',
        });
        const chunks = await chunker.splitText(cleanString(xlsxParsed));
        for (const chunk of chunks) {
            yield {
                pageContent: chunk,
                metadata: {
                    type: 'ExcelLoader',
                    source: this.filePathOrUrl,
                },
            };
        }
    }
}
//# sourceMappingURL=excel-loader.js.map