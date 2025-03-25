import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import md5 from 'md5';

import { BaseLoader } from '@llm-tools/embedjs-interfaces';
import { truncateCenterString, cleanString } from '@llm-tools/embedjs-utils';

export function returnTagID(fullStr: string, strLen: number) {
    let parts = fullStr.split(' ');
    if (parts.length > 1) {
        return parts[0];
    } else {
        if (fullStr.length <= strLen) return fullStr;
        //SVOBODA
        return fullStr.substring(0, strLen);
    }
}

export class TextLoader extends BaseLoader<{ type: 'TextLoader' }> {
    private readonly text: string;

    constructor({
        text,
        chunkSize,
        chunkOverlap,
        middleId,
    }: {
        text: string;
        chunkSize?: number;
        chunkOverlap?: number;
        middleId?: string;
    }) {
        if (middleId) {
            let id = `TextLoader_${middleId}_${md5(text)}`;
            super(id, { text: returnTagID(text, 50) }, chunkSize ?? 300, chunkOverlap ?? 0);
        } else {
            let id = `TextLoader_${md5(text)}`;
            super(id, { text: truncateCenterString(text, 50) }, chunkSize ?? 300, chunkOverlap ?? 0);
        }

        this.text = text;
    }

    override async *getUnfilteredChunks() {
        let tuncatedObjectString;
        if (this.uniqueId.split('_').length > 1) {
            tuncatedObjectString = returnTagID(this.text, 50);
        } else {
            tuncatedObjectString = truncateCenterString(this.text, 50);
        }

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
