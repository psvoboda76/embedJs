import { Options as CsvParseOptions } from 'csv-parse';
import { BaseLoader } from '@llm-tools/embedjs-interfaces';
export declare class CsvLoader extends BaseLoader<{
    type: 'CsvLoader';
}> {
    private readonly debug;
    private readonly csvParseOptions;
    private readonly filePathOrUrl;
    private readonly isUrl;
    constructor({ filePathOrUrl, csvParseOptions, chunkOverlap, chunkSize, }: {
        filePathOrUrl: string;
        csvParseOptions?: CsvParseOptions;
        chunkSize?: number;
        chunkOverlap?: number;
    });
    getUnfilteredChunks(): AsyncGenerator<{
        pageContent: string;
        metadata: {
            type: "CsvLoader";
            source: string;
        };
    }, void, unknown>;
}
