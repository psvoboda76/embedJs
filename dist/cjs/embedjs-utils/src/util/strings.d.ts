import { Message } from '@llm-tools/embedjs-interfaces';
export declare function truncateCenterString(fullStr: string, strLen: number, separator?: string): string;
export declare function cleanString(text: string): string;
export declare function stringFormat(template: string, ...args: string[]): string;
export declare function historyToString(history: Message[]): string;
export declare function toTitleCase(str: string): string;
export declare function isValidURL(candidateUrl: string): boolean;
export declare function isValidJson(str: string): boolean;
