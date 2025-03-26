import { BaseStore, BaseVectorDatabase, BaseEmbeddings, BaseLoader, BaseModel, SIMPLE_MODELS } from '@llm-tools/embedjs-interfaces';
import { RAGApplication } from './rag-application.js';
export declare class RAGApplicationBuilder {
    private temperature;
    private model;
    private vectorDatabase;
    private loaders;
    private store;
    private systemMessage;
    private searchResultCount;
    private embeddingModel;
    private embeddingRelevanceCutOff;
    private storeConversationsToDefaultThread;
    constructor();
    /**
     * The `build` function creates a new `RAGApplication` entity and initializes it asynchronously based on provided parameters.
     * @returns An instance of the `RAGApplication` class after it has been initialized asynchronously.
     */
    build(): Promise<RAGApplication>;
    /**
     * The function setVectorDatabase sets a BaseVectorDatabase object
     * @param {BaseVectorDatabase} vectorDatabase - The `vectorDatabase` parameter is an instance of the `BaseVectorDatabase` class, which
     * is used to store vectors in a database.
     * @returns The `this` object is being returned, which allows for method chaining.
     */
    setVectorDatabase(vectorDatabase: BaseVectorDatabase): this;
    setEmbeddingModel(embeddingModel: BaseEmbeddings): this;
    setModel(model: 'NO_MODEL' | SIMPLE_MODELS | BaseModel): this;
    setStore(store: BaseStore): this;
    setTemperature(temperature: number): this;
    setSystemMessage(systemMessage: string): this;
    setEmbeddingRelevanceCutOff(embeddingRelevanceCutOff: number): this;
    addLoader(loader: BaseLoader): this;
    /**
     * The setSearchResultCount function sets the search result count
     * @param {number} searchResultCount - The `searchResultCount` parameter
     * represents the count of search results picked up from the vector store per query.
     * @returns The `this` object is being returned, which allows for method chaining.
     */
    setSearchResultCount(searchResultCount: number): this;
    /**
     * The setParamStoreConversationsToDefaultThread configures whether the conversation hisotry for queries made
     * without a conversationId passed should be stored in the default thread. This is set to True by default.
     */
    setParamStoreConversationsToDefaultThread(storeConversationsToDefaultThread: boolean): this;
    getLoaders(): BaseLoader<Record<string, string | number | boolean>, Record<string, unknown>>[];
    getSearchResultCount(): number;
    getVectorDatabase(): BaseVectorDatabase;
    getTemperature(): number;
    getEmbeddingRelevanceCutOff(): number;
    getSystemMessage(): string;
    getStore(): BaseStore;
    getEmbeddingModel(): BaseEmbeddings;
    getModel(): BaseModel | SIMPLE_MODELS;
    getParamStoreConversationsToDefaultThread(): boolean;
}
