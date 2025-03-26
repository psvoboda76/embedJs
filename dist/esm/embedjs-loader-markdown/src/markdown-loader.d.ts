import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export declare class MarkdownLoader extends BaseLoader<{
    type: 'MarkdownLoader';
}> {
    private readonly debug;
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
            type: "MarkdownLoader";
            source: string;
        };
    }, void, unknown>;
}
