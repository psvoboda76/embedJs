import { RAGApplicationBuilder } from './rag-application-builder.js';
import { AddLoaderReturn, BaseLoader, Chunk, QueryResponse } from '@llm-tools/embedjs-interfaces';
export declare class RAGApplication {
    private readonly debug;
    private readonly storeConversationsToDefaultThread;
    private readonly embeddingRelevanceCutOff;
    private readonly searchResultCount;
    private readonly systemMessage;
    private readonly vectorDatabase;
    private readonly embeddingModel;
    private readonly store;
    private loaders;
    private model;
    constructor(llmBuilder: RAGApplicationBuilder);
    /**
     * The function initializes various components of a language model using provided configurations
     * and data. This is an internal method and does not need to be invoked manually.
     * @param {RAGApplicationBuilder} llmBuilder - The `llmBuilder` parameter in the `init` function is
     * an instance of the `RAGApplicationBuilder` class. It is used to build and configure a Language
     * Model (LLM) for a conversational AI system. The function initializes various components of the
     * LLM based on the configuration provided
     */
    init(llmBuilder: RAGApplicationBuilder): Promise<void>;
    /**
     * The function getModel retrieves a specific BaseModel or SIMPLE_MODEL based on the input provided.
     * @param {BaseModel | SIMPLE_MODELS | null} model - The `getModel` function you provided is an
     * asynchronous function that takes a parameter `model` of type `BaseModel`, `SIMPLE_MODELS`, or
     * `null`.
     * @returns The `getModel` function returns a Promise that resolves to a `BaseModel` object. If the
     * `model` parameter is an object, it returns the object itself. If the `model` parameter is
     * `null`, it returns `null`. If the `model` parameter is a specific value from the `SIMPLE_MODELS`
     * enum, it creates a new `BaseModel` object based on the model name.
     */
    private getModel;
    /**
     * The function `embedChunks` embeds the content of chunks by invoking the planned embedding model.
     * @param {Pick<Chunk, 'pageContent'>[]} chunks - The `chunks` parameter is an array of objects
     * that have a property `pageContent` which contains text content for each chunk.
     * @returns The `embedChunks` function is returning the embedded vectors for the chunks.
     */
    private embedChunks;
    /**
     * The function `getChunkUniqueId` generates a unique identifier by combining a loader unique ID and
     * an increment ID.
     * @param {string} loaderUniqueId - A unique identifier for the loader.
     * @param {number} incrementId - The `incrementId` parameter is a number that represents the
     * increment value used to generate a unique chunk identifier.
     * @returns The function `getChunkUniqueId` returns a string that combines the `loaderUniqueId` and
     * `incrementId`.
     */
    private getChunkUniqueId;
    /**
     * The function `addLoader` asynchronously initalizes a loader using the provided parameters and adds
     * it to the system.
     * @param {LoaderParam} loaderParam - The `loaderParam` parameter is a string, object or instance of BaseLoader
     * that contains the necessary information to create a loader.
     * @param {boolean} forceReload - The `forceReload` parameter is a boolean used to indicate if a loader should be reloaded.
     * By default, loaders which have been previously run are not reloaded.
     * @returns The function `addLoader` returns an object with the following properties:
     * - `entriesAdded`: Number of new entries added during the loader operation
     * - `uniqueId`: Unique identifier of the loader
     * - `loaderType`: Name of the loader's constructor class
     */
    addLoader(loaderParam: BaseLoader, forceReload?: boolean): Promise<AddLoaderReturn>;
    /**
     * The function `_addLoader` asynchronously adds a loader, processes its chunks, and handles
     * incremental loading if supported by the loader.
     * @param {BaseLoader} loader - The `loader` parameter in the `_addLoader` method is an instance of the
     * `BaseLoader` class.
     * @returns The function `_addLoader` returns an object with the following properties:
     * - `entriesAdded`: Number of new entries added during the loader operation
     * - `uniqueId`: Unique identifier of the loader
     * - `loaderType`: Name of the loader's constructor class
     */
    private _addLoader;
    /**
     * The `incrementalLoader` function asynchronously processes incremental chunks for a loader.
     * @param {string} uniqueId - The `uniqueId` parameter is a string that serves as an identifier for
     * the loader.
     * @param incrementalGenerator - The `incrementalGenerator` parameter is an asynchronous generator
     * function that yields `LoaderChunk` objects. It is used to incrementally load chunks of data for a specific loader
     */
    private incrementalLoader;
    /**
     * The function `getLoaders` asynchronously retrieves a list of loaders loaded so far. This includes
     * internal loaders that were loaded by other loaders. It requires that cache is enabled to work.
     * @returns The list of loaders with some metadata about them.
     */
    getLoaders(): Promise<import("@llm-tools/embedjs-interfaces").LoaderListEntry[]>;
    /**
     * The function `batchLoadChunks` processes chunks of data in batches and formats them for insertion.
     * @param {string} uniqueId - The `uniqueId` parameter is a string that represents a unique
     * identifier for loader being processed.
     * @param generator - The `incrementalGenerator` parameter in the `batchLoadChunks`
     * function is an asynchronous generator that yields `LoaderChunk` objects.
     * @returns The `batchLoadChunks` function returns an object with two properties:
     * 1. `newInserts`: The total number of new inserts made during the batch loading process.
     * 2. `formattedChunks`: An array containing the formatted chunks that were processed during the
     * batch loading process.
     */
    private batchLoadChunks;
    /**
     * The function `batchLoadEmbeddings` asynchronously loads embeddings for formatted chunks and
     * inserts them into a vector database.
     * @param {string} loaderUniqueId - The `loaderUniqueId` parameter is a unique identifier for the
     * loader that is used to load embeddings.
     * @param {Chunk[]} formattedChunks - `formattedChunks` is an array of Chunk objects that contain
     * page content, metadata, and other information needed for processing. The `batchLoadEmbeddings`
     * function processes these chunks in batches to obtain embeddings for each chunk and then inserts
     * them into a database for further use.
     * @returns The function `batchLoadEmbeddings` returns the result of inserting the embed chunks
     * into the vector database.
     */
    private batchLoadEmbeddings;
    /**
     * The function `getEmbeddingsCount` returns the count of embeddings stored in a vector database
     * asynchronously.
     * @returns The `getEmbeddingsCount` method is returning the number of embeddings stored in the
     * vector database. It is an asynchronous function that returns a Promise with the count of
     * embeddings as a number.
     */
    getEmbeddingsCount(): Promise<number>;
    /**
     * The function `deleteConversation` deletes all entries related to a particular conversation from the database
     * @param {string} conversationId - The `conversationId` that you want to delete. Pass 'default' to delete
     * the default conversation thread that is created and maintained automatically
     */
    deleteConversation(conversationId: string): Promise<void>;
    /**
     * The function `deleteLoader` deletes embeddings from a loader after confirming the action.
     * @param {string} uniqueLoaderId - The `uniqueLoaderId` parameter is a string that represents the
     * identifier of the loader that you want to delete.
     * @returns The `deleteLoader` method returns a boolean value indicating the success of the operation.
     */
    deleteLoader(uniqueLoaderId: string): Promise<boolean>;
    /**
     * The function `reset` deletes all embeddings from the vector database if a
     * confirmation is provided.
     * @returns The `reset` function returns a boolean value indicating the result.
     */
    reset(): Promise<boolean>;
    /**
     * The function `getEmbeddings` retrieves embeddings for a query, performs similarity search,
     * filters and sorts the results based on relevance score, and returns a subset of the top results.
     * @param {string} cleanQuery - The `cleanQuery` parameter is a string that represents the query
     * input after it has been cleaned or processed to remove any unnecessary characters, symbols, or
     * noise. This clean query is then used to generate embeddings for similarity search.
     * @returns The `getEmbeddings` function returns a filtered and sorted array of search results based
     * on the similarity score of the query embedded in the cleanQuery string. The results are filtered
     * based on a relevance cutoff value, sorted in descending order of score, and then sliced to return
     * only the number of results specified by the `searchResultCount` property.
     */
    getEmbeddings(cleanQuery: string, limitsPerDoc?: number): Promise<import("@llm-tools/embedjs-interfaces").ExtractChunkData[]>;
    /**
     * The `search` function retrieves the unique embeddings for a given query without calling a LLM.
     * @param {string} query - The `query` parameter is a string that represents the input query that
     * needs to be processed.
     * @returns An array of unique page content items / chunks.
     */
    search(query: string, limitsPerDoc?: number): Promise<import("@llm-tools/embedjs-interfaces").ExtractChunkData[]>;
    /**
     * This function takes a user query, retrieves relevant context, identifies unique sources, and
     * returns the query result along with the list of sources.
     * @param {string} userQuery - The `userQuery` parameter is a string that represents the query
     * input provided by the user. It is used as input to retrieve context and ultimately generate a
     * result based on the query.
     * @param [options] - The `options` parameter in the `query` function is an optional object that
     * can have the following properties:
     * - conversationId - The `conversationId` parameter in the `query` method is an
     * optional parameter that represents the unique identifier for a conversation. It allows you to
     * track and associate the query with a specific conversation thread if needed. If provided, it can be
     * used to maintain context or history related to the conversation.
     * - customContext - You can pass in custom context from your own RAG stack. Passing.
     * your own context will disable the inbuilt RAG retrieval for that specific query
     * @returns The `query` method returns a Promise that resolves to an object with two properties:
     * `result` and `sources`. The `result` property is a string representing the result of querying
     * the LLM model with the provided query template, user query, context, and conversation history. The
     * `sources` property is an array of strings representing unique sources used to generate the LLM response.
     */
    query(userQuery: string, options?: {
        conversationId?: string;
        customContext?: Chunk[];
        limitConversation?: number;
        callback?: any;
    }): Promise<QueryResponse>;
}
