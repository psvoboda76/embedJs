import { Stream } from 'stream';
export declare function streamToBuffer(stream: Stream): Promise<Buffer>;
export declare function streamToString(stream: Stream): Promise<string>;
export declare function contentTypeToMimeType(contentType: string): string;
