import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export declare class PptLoader extends BaseLoader<{
    type: 'PptLoader';
}> {
    private readonly filePathOrUrl;
    private readonly isUrl;
    constructor({ filePathOrUrl, chunkOverlap, chunkSize, }: {
        filePathOrUrl: string;
        chunkSize?: number;
        chunkOverlap?: number;
    });
    getUnfilteredChunks(): AsyncGenerator<{
        pageContent: string;
        metadata: {
            type: "PptLoader";
            source: string;
        };
    }, void, unknown>;
}
