import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export declare class ConfluenceLoader extends BaseLoader<{
    type: 'ConfluenceLoader';
}, {
    version: number;
}> {
    private readonly debug;
    private readonly confluence;
    private readonly confluenceBaseUrl;
    private readonly spaceName;
    private readonly lastUpdatedFilter?;
    constructor({ spaceName, confluenceBaseUrl, confluenceUsername, confluenceToken, chunkSize, chunkOverlap, filterOptions, }: {
        spaceName: string;
        confluenceBaseUrl?: string;
        confluenceUsername?: string;
        confluenceToken?: string;
        chunkSize?: number;
        chunkOverlap?: number;
        filterOptions?: {
            lastUpdatedFilter: Date;
        };
    });
    getUnfilteredChunks(): AsyncGenerator<any, void, unknown>;
    private processSpace;
    private processPage;
    private getContentChunks;
}
