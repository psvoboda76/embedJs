import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export declare class YoutubeChannelLoader extends BaseLoader<{
    type: 'YoutubeChannelLoader';
}> {
    private readonly debug;
    private readonly channelId;
    constructor({ youtubeChannelId, chunkSize, chunkOverlap, }: {
        youtubeChannelId: string;
        chunkSize?: number;
        chunkOverlap?: number;
    });
    getUnfilteredChunks(): AsyncGenerator<{
        metadata: {
            type: "YoutubeChannelLoader";
            originalSource: string;
            source: string;
        };
        pageContent: string;
    }, void, unknown>;
}
