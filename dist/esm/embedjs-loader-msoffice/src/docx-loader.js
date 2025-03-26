import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { getTextExtractor } from 'office-text-extractor';
import md5 from 'md5';
import { BaseLoader } from '@llm-tools/embedjs-interfaces';
import { isValidURL, cleanString } from '@llm-tools/embedjs-utils';
export class DocxLoader extends BaseLoader {
    filePathOrUrl;
    isUrl;
    constructor({ filePathOrUrl, chunkOverlap, chunkSize, }) {
        super(`DocxLoader_${md5(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1000, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
    }
    async *getUnfilteredChunks() {
        const chunker = new RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        const extractor = getTextExtractor();
        const docxParsed = await extractor.extractText({
            input: this.filePathOrUrl,
            type: this.isUrl ? 'url' : 'file',
        });
        const chunks = await chunker.splitText(cleanString(docxParsed));
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
//# sourceMappingURL=docx-loader.js.map