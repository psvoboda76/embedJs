import { BaseStore, Conversation, LoaderListEntry, Message } from '@llm-tools/embedjs-interfaces';
export declare class LibSqlStore implements BaseStore {
    private readonly debug;
    private readonly loadersCustomDataTableName;
    private readonly conversationsTableName;
    private readonly loadersTableName;
    private readonly client;
    constructor({ path, loadersTableName, conversationsTableName, loadersCustomDataTableName, }: {
        path: string;
        loadersTableName?: string;
        conversationsTableName?: string;
        loadersCustomDataTableName?: string;
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
    getConversation(conversationId: string): Promise<Conversation>;
    hasConversation(conversationId: string): Promise<boolean>;
    deleteConversation(conversationId: string): Promise<void>;
    addEntryToConversation(conversationId: string, entry: Message): Promise<void>;
    clearConversations(): Promise<void>;
    addConversation(_conversationId: string): Promise<void>;
}
