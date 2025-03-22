import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import md5 from 'md5';

import { BaseLoader } from '@llm-tools/embedjs-interfaces';
import { truncateCenterString, returnTagID, cleanString } from '@llm-tools/embedjs-utils';

export class TextLoader extends BaseLoader<{ type: 'TextLoader' }> {
    private readonly text: string;

    constructor({ text, chunkSize, chunkOverlap }: { text: string; chunkSize?: number; chunkOverlap?: number }) {
        super(`TextLoader_${md5(text)}`, { text: returnTagID(text, 50) }, chunkSize ?? 300, chunkOverlap ?? 0);
        this.text = text;
    }

    override async *getUnfilteredChunks() {
        const tuncatedObjectString = returnTagID(this.text, 50);
        const chunker = new RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        const chunks = await chunker.splitText(cleanString(this.text));

        for (const chunk of chunks) {
            yield {
                pageContent: chunk,
                metadata: {
                    type: 'TextLoader' as const,
                    source: tuncatedObjectString,
                    textId: this.uniqueId,
                },
            };
        }
    }
}
