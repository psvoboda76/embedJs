import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export declare function returnTagID(fullStr: string, strLen: number): string;
export declare class TextLoader extends BaseLoader<{
    type: 'TextLoader';
}> {
    private readonly text;
    constructor({ text, chunkSize, chunkOverlap, middleId, }: {
        text: string;
        chunkSize?: number;
        chunkOverlap?: number;
        middleId?: string;
    });
    getUnfilteredChunks(): AsyncGenerator<{
        pageContent: string;
        metadata: {
            type: "TextLoader";
            source: any;
            textId: string;
        };
    }, void, unknown>;
}
