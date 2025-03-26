import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export declare class YoutubeLoader extends BaseLoader<{
    type: 'YoutubeLoader';
}> {
    private readonly debug;
    private readonly videoIdOrUrl;
    constructor({ videoIdOrUrl, chunkSize, chunkOverlap, }: {
        videoIdOrUrl: string;
        chunkSize?: number;
        chunkOverlap?: number;
    });
    getUnfilteredChunks(): AsyncGenerator<{
        pageContent: string;
        metadata: {
            type: "YoutubeLoader";
            source: string;
        };
    }, void, unknown>;
}
