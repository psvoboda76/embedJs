import { X2jOptions } from 'fast-xml-parser';
import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export declare class XmlLoader extends BaseLoader<{
    type: 'XmlLoader';
}> {
    private readonly debug;
    private readonly xmlParseOptions;
    private readonly filePathOrUrl;
    private readonly isUrl;
    constructor({ filePathOrUrl, xmlParseOptions, chunkOverlap, chunkSize, }: {
        filePathOrUrl: string;
        xmlParseOptions?: X2jOptions;
        chunkSize?: number;
        chunkOverlap?: number;
    });
    getUnfilteredChunks(): AsyncGenerator<{
        pageContent: string;
        metadata: {
            type: "XmlLoader";
            source: string;
        };
    }, void, unknown>;
}
