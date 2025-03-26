import { BaseStore, Conversation, LoaderListEntry, Message } from '@llm-tools/embedjs-interfaces';
export declare class LmdbStore implements BaseStore {
    private readonly debug;
    private static readonly LOADER_METADATA_PREFIX;
    private static readonly CUSTOM_KEYS_PREFIX;
    private readonly dataPath;
    private database;
    constructor({ path }: {
        path: string;
    });
    init(): Promise<void>;
    addLoaderMetadata(loaderId: string, value: LoaderListEntry): Promise<void>;
    getLoaderMetadata(loaderId: string): Promise<LoaderListEntry>;
    hasLoaderMetadata(loaderId: string): Promise<boolean>;
    getAllLoaderMetadata(): Promise<LoaderListEntry[]>;
    loaderCustomSet<T extends Record<string, unknown>>(loaderId: string, key: string, value: T): Promise<void>;
    loaderCustomGet<T extends Record<string, unknown>>(key: string): Promise<T>;
    loaderCustomHas(key: string): Promise<boolean>;
    loaderCustomDelete(key: string): Promise<void>;
    deleteLoaderMetadataAndCustomValues(loaderId: string): Promise<void>;
    addConversation(conversationId: string): Promise<void>;
    getConversation(conversationId: string): Promise<Conversation>;
    hasConversation(conversationId: string): Promise<boolean>;
    deleteConversation(conversationId: string): Promise<void>;
    addEntryToConversation(conversationId: string, entry: Message): Promise<void>;
    clearConversations(): Promise<void>;
}
