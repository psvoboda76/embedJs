type getSafeResponsePartial = {
    headers: Headers;
    statusCode: number;
};
export declare function getSafe(url: string, options: {
    headers?: Record<string, string>;
    format: 'text';
}): Promise<{
    body: string;
} & getSafeResponsePartial>;
export declare function getSafe(url: string, options: {
    headers?: Record<string, string>;
    format: 'buffer';
}): Promise<{
    body: Buffer;
} & getSafeResponsePartial>;
export declare function getSafe(url: string, options?: {
    headers?: Record<string, string>;
    format?: 'stream';
}): Promise<{
    body: NodeJS.ReadableStream;
} & getSafeResponsePartial>;
export {};
