export declare function mapAsync<T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => Promise<U>): Promise<U[]>;
export declare function filterAsync<T>(array: T[], callbackfn: (value: T, index: number, array: T[]) => Promise<boolean>): Promise<T[]>;
export declare function createArrayChunks<T>(arr: T[], size: number): T[][];
export declare function getUnique<T extends object>(array: Array<T>, K: string): T[];
