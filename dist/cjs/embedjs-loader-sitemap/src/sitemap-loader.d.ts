import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export declare class SitemapLoader extends BaseLoader<{
    type: 'SitemapLoader';
}> {
    static test(url: string): Promise<boolean>;
    private readonly debug;
    private readonly url;
    constructor({ url, chunkSize, chunkOverlap }: {
        url: string;
        chunkSize?: number;
        chunkOverlap?: number;
    });
    getUnfilteredChunks(): AsyncGenerator<{
        metadata: {
            type: "SitemapLoader";
            originalSource: string;
            source: string;
        };
        pageContent: string;
    }, void, unknown>;
}
