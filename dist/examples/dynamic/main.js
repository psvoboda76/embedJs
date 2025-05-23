var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// core/embedjs-interfaces/src/interfaces/base-loader.ts
import md5 from "md5";
import createDebugMessages from "debug";
import { EventEmitter } from "node:events";
var BaseLoader;
var init_base_loader = __esm({
  "core/embedjs-interfaces/src/interfaces/base-loader.ts"() {
    BaseLoader = class _BaseLoader extends EventEmitter {
      static store;
      static setCache(store) {
        _BaseLoader.store = store;
      }
      uniqueId;
      chunkSize;
      chunkOverlap;
      canIncrementallyLoad;
      loaderMetadata;
      constructor(uniqueId, loaderMetadata, chunkSize = 5, chunkOverlap = 0, canIncrementallyLoad = false) {
        super();
        this.uniqueId = uniqueId;
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
        this.loaderMetadata = loaderMetadata;
        this.canIncrementallyLoad = canIncrementallyLoad;
        createDebugMessages("embedjs:loader:BaseLoader")(`New loader class initalized with key ${uniqueId}`);
      }
      getUniqueId() {
        return this.uniqueId;
      }
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async init() {
      }
      // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
      injectModel(_model) {
      }
      async recordLoaderInCache(chunksProcessed) {
        if (!_BaseLoader.store)
          return;
        const loaderData = {
          uniqueId: this.uniqueId,
          type: this.constructor.name,
          loaderMetadata: this.loaderMetadata,
          chunksProcessed
        };
        await _BaseLoader.store.addLoaderMetadata(this.uniqueId, loaderData);
      }
      getCustomCacheKey(key) {
        return `LOADER_CUSTOM_${this.uniqueId}_${key}`;
      }
      async checkInCache(key) {
        if (!_BaseLoader.store)
          return false;
        return _BaseLoader.store.loaderCustomHas(this.getCustomCacheKey(key));
      }
      async getFromCache(key) {
        if (!_BaseLoader.store)
          return null;
        return _BaseLoader.store.loaderCustomGet(this.getCustomCacheKey(key));
      }
      async saveToCache(key, value) {
        if (!_BaseLoader.store)
          return;
        await _BaseLoader.store.loaderCustomSet(this.uniqueId, this.getCustomCacheKey(key), value);
      }
      async deleteFromCache(key) {
        if (!_BaseLoader.store)
          return false;
        return _BaseLoader.store.loaderCustomDelete(this.getCustomCacheKey(key));
      }
      async loadIncrementalChunk(incrementalGenerator) {
        this.emit("incrementalChunkAvailable", incrementalGenerator);
      }
      /**
       * This TypeScript function asynchronously processes chunks of data, cleans up the content,
       * calculates a content hash, and yields the modified chunks.
       */
      async *getChunks() {
        const chunks = await this.getUnfilteredChunks();
        let count = 0;
        for await (const chunk of chunks) {
          chunk.pageContent = chunk.pageContent.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s\s+/g, " ").trim();
          if (chunk.pageContent.length > 0) {
            yield {
              ...chunk,
              contentHash: md5(chunk.pageContent)
            };
            count++;
          }
        }
        await this.recordLoaderInCache(count);
      }
    };
  }
});

// core/embedjs-interfaces/src/interfaces/base-embeddings.ts
var BaseEmbeddings;
var init_base_embeddings = __esm({
  "core/embedjs-interfaces/src/interfaces/base-embeddings.ts"() {
    BaseEmbeddings = class {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async init() {
      }
    };
  }
});

// core/embedjs-interfaces/src/interfaces/base-model.ts
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import createDebugMessages2 from "debug";
import { v4 as uuidv4 } from "uuid";
var BaseModel;
var init_base_model = __esm({
  "core/embedjs-interfaces/src/interfaces/base-model.ts"() {
    BaseModel = class _BaseModel {
      baseDebug = createDebugMessages2("embedjs:model:BaseModel");
      static store;
      static defaultTemperature;
      static setDefaultTemperature(temperature) {
        _BaseModel.defaultTemperature = temperature;
      }
      static setStore(cache) {
        _BaseModel.store = cache;
      }
      _temperature;
      constructor(temperature) {
        this._temperature = temperature;
      }
      get temperature() {
        return this._temperature ?? _BaseModel.defaultTemperature;
      }
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      async init() {
      }
      extractUniqueSources(supportingContext) {
        const uniqueSources = /* @__PURE__ */ new Map();
        supportingContext.forEach((item) => {
          const { metadata } = item;
          if (metadata && metadata.source) {
            if (!uniqueSources.has(metadata.source)) {
              uniqueSources.set(metadata.source, {
                source: metadata.source,
                loaderId: metadata.uniqueLoaderId
                // Assuming this field always exists
              });
            }
          }
        });
        return Array.from(uniqueSources.values());
      }
      async prepare(system, userQuery, supportingContext, pastConversations) {
        const messages = [new SystemMessage(system)];
        messages.push(
          new SystemMessage(`Supporting context: ${supportingContext.map((s) => s.pageContent).join("; ")}`)
        );
        messages.push(
          ...pastConversations.map((c) => {
            if (c.actor === "AI")
              return new AIMessage({ content: c.content });
            else if (c.actor === "SYSTEM")
              return new SystemMessage({ content: c.content });
            else
              return new HumanMessage({ content: c.content });
          })
        );
        messages.push(new HumanMessage(`${userQuery}?`));
        return messages;
      }
      async query(system, userQuery, supportingContext, conversationId, limitConversation, callback, estimateTokens) {
        let conversation;
        if (conversationId) {
          if (!await _BaseModel.store.hasConversation(conversationId)) {
            this.baseDebug(`Conversation with id '${conversationId}' is new`);
            await _BaseModel.store.addConversation(conversationId);
          }
          conversation = await _BaseModel.store.getConversation(conversationId);
          this.baseDebug(
            `${conversation.entries.length} history entries found for conversationId '${conversationId}'`
          );
          if (limitConversation && conversation.entries.length > 0) {
            let userQueryTokens = estimateTokens(userQuery);
            let text = "";
            for (let i = 0; i < conversation.entries.length - 1; i++) {
              let c = conversation.entries[i];
              text = text + c.actor + ": " + c.content + "\n";
            }
            let tokenCount = estimateTokens(text);
            while (conversation.entries.length > 0 && tokenCount + userQueryTokens > limitConversation) {
              conversation.entries.shift();
              text = "";
              for (let i = 0; i < conversation.entries.length - 1; i++) {
                let c = conversation.entries[i];
                text = text + c.actor + ": " + c.content + "\n";
              }
              tokenCount = estimateTokens(text);
            }
          }
          await _BaseModel.store.addEntryToConversation(conversationId, {
            id: uuidv4(),
            timestamp: /* @__PURE__ */ new Date(),
            actor: "HUMAN",
            content: userQuery
          });
        } else {
          this.baseDebug("Conversation history is disabled as no conversationId was provided");
          conversation = { conversationId: "default", entries: [] };
        }
        const messages = await this.prepare(system, userQuery, supportingContext, conversation.entries.slice(0, -1));
        const uniqueSources = this.extractUniqueSources(supportingContext);
        const timestamp = /* @__PURE__ */ new Date();
        const id = uuidv4();
        const response = await this.runQuery(messages, callback);
        const newEntry = {
          id,
          timestamp,
          content: response.result,
          actor: "AI",
          sources: uniqueSources
        };
        if (conversationId) {
          await _BaseModel.store.addEntryToConversation(conversationId, newEntry);
        }
        return {
          ...newEntry,
          tokenUse: {
            inputTokens: response.tokenUse?.inputTokens ?? "UNKNOWN",
            outputTokens: response.tokenUse?.outputTokens ?? "UNKNOWN"
          }
        };
      }
      async simpleQuery(messages) {
        const response = await this.runQuery(messages);
        return {
          result: response.result,
          tokenUse: {
            inputTokens: response.tokenUse?.inputTokens ?? "UNKNOWN",
            outputTokens: response.tokenUse?.outputTokens ?? "UNKNOWN"
          }
        };
      }
    };
  }
});

// core/embedjs-interfaces/src/types.ts
var init_types = __esm({
  "core/embedjs-interfaces/src/types.ts"() {
  }
});

// core/embedjs-interfaces/src/constants.ts
var DEFAULT_INSERT_BATCH_SIZE;
var init_constants = __esm({
  "core/embedjs-interfaces/src/constants.ts"() {
    DEFAULT_INSERT_BATCH_SIZE = 500;
  }
});

// core/embedjs-interfaces/src/index.ts
var init_src = __esm({
  "core/embedjs-interfaces/src/index.ts"() {
    init_base_loader();
    init_base_embeddings();
    init_base_model();
    init_types();
    init_constants();
  }
});

// core/embedjs-utils/src/util/arrays.ts
function getUnique(array, K) {
  const seen = {};
  return array.filter(function(item) {
    return Object.prototype.hasOwnProperty.call(seen, item[K]()) ? false : seen[item[K]()] = true;
  });
}
var init_arrays = __esm({
  "core/embedjs-utils/src/util/arrays.ts"() {
  }
});

// core/embedjs-utils/src/util/log.ts
var init_log = __esm({
  "core/embedjs-utils/src/util/log.ts"() {
  }
});

// core/embedjs-utils/src/util/stream.ts
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const _buf = Array();
    stream.on("data", (chunk) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", (err) => reject(`error converting stream - ${err}`));
  });
}
function contentTypeToMimeType(contentType) {
  if (!contentType)
    return contentType;
  if (contentType.includes(";"))
    return contentType.split(";")[0];
  else
    return contentType;
}
var init_stream = __esm({
  "core/embedjs-utils/src/util/stream.ts"() {
  }
});

// core/embedjs-utils/src/util/strings.ts
function truncateCenterString(fullStr, strLen, separator) {
  if (fullStr.length <= strLen)
    return fullStr;
  separator = separator || "...";
  const sepLen = separator.length, charsToShow = strLen - sepLen, frontChars = Math.ceil(charsToShow / 2), backChars = Math.floor(charsToShow / 2);
  return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
}
function cleanString(text) {
  text = text.replace(/\\/g, "");
  text = text.replace(/#/g, " ");
  text = text.replace(/\. \./g, ".");
  text = text.replace(/\s\s+/g, " ");
  text = text.replace(/(\r\n|\n|\r)/gm, " ");
  return text.trim();
}
function isValidURL(candidateUrl) {
  try {
    const url = new URL(candidateUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
var init_strings = __esm({
  "core/embedjs-utils/src/util/strings.ts"() {
  }
});

// core/embedjs-utils/src/util/web.ts
import createDebugMessages3 from "debug";
async function getSafe(url, options) {
  const headers = options?.headers ?? {};
  headers["User-Agent"] = headers["User-Agent"] ?? DEFAULT_USER_AGENT;
  const format = options?.format ?? "stream";
  const response = await fetch(url, { headers });
  createDebugMessages3("embedjs:util:getSafe")(`URL '${url}' returned status code ${response.status}`);
  if (response.status !== 200)
    throw new Error(`Failed to fetch URL '${url}'. Got status code ${response.status}.`);
  return {
    body: format === "text" ? await response.text() : format === "buffer" ? Buffer.from(await response.arrayBuffer()) : response.body,
    statusCode: response.status,
    headers: response.headers
  };
}
var DEFAULT_USER_AGENT;
var init_web = __esm({
  "core/embedjs-utils/src/util/web.ts"() {
    DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
  }
});

// core/embedjs-utils/src/index.ts
var init_src2 = __esm({
  "core/embedjs-utils/src/index.ts"() {
    init_arrays();
    init_log();
    init_stream();
    init_strings();
    init_web();
  }
});

// models/embedjs-openai/src/openai-model.ts
import createDebugMessages4 from "debug";
import { ChatOpenAI } from "@langchain/openai";
var OpenAi;
var init_openai_model = __esm({
  "models/embedjs-openai/src/openai-model.ts"() {
    init_src();
    OpenAi = class extends BaseModel {
      constructor(configuration) {
        super(configuration.temperature);
        this.configuration = configuration;
      }
      debug = createDebugMessages4("embedjs:model:OpenAi");
      model;
      async init() {
        this.model = new ChatOpenAI(this.configuration);
      }
      async runQuery(messages, callback) {
        this.debug("Executing OpenAI model with prompt -", messages[messages.length - 1].content);
        if (callback) {
          const stream = await this.model.stream(messages);
          const chunks = [];
          for await (const chunk of stream) {
            if (chunk.content != null) {
              chunks.push(chunk.content);
              callback(chunk.content);
            } else {
              chunks.push(chunk);
              callback(chunk);
            }
          }
          let res = chunks.join("");
          return {
            result: res
          };
        } else {
          const result = await this.model.invoke(messages);
          this.debug("OpenAI response -", result);
          return {
            result: result.content.toString(),
            tokenUse: {
              inputTokens: result.response_metadata.tokenUsage.promptTokens,
              outputTokens: result.response_metadata.tokenUsage.completionTokens
            }
          };
        }
      }
    };
  }
});

// models/embedjs-openai/src/azure-openai-model.ts
import createDebugMessages5 from "debug";
import { AzureChatOpenAI } from "@langchain/openai";
var AzureOpenAi;
var init_azure_openai_model = __esm({
  "models/embedjs-openai/src/azure-openai-model.ts"() {
    init_src();
    AzureOpenAi = class extends BaseModel {
      constructor(configuration) {
        super(configuration.temperature);
        this.configuration = configuration;
      }
      debug = createDebugMessages5("embedjs:model:OpenAi");
      model;
      async init() {
        this.model = new AzureChatOpenAI(this.configuration);
      }
      async runQuery(messages) {
        this.debug("Executing Azure OpenAI model with prompt -", messages[messages.length - 1].content);
        const result = await this.model.invoke(messages);
        this.debug("Azure OpenAI response -", result);
        return {
          result: result.content.toString(),
          tokenUse: {
            inputTokens: result.response_metadata.tokenUsage.promptTokens,
            outputTokens: result.response_metadata.tokenUsage.completionTokens
          }
        };
      }
    };
  }
});

// models/embedjs-openai/src/azure-openai-embeddings.ts
import { AzureOpenAIEmbeddings as LangchainAzureOpenAiEmbeddings } from "@langchain/openai";
var AzureOpenAiEmbeddings;
var init_azure_openai_embeddings = __esm({
  "models/embedjs-openai/src/azure-openai-embeddings.ts"() {
    init_src();
    AzureOpenAiEmbeddings = class extends BaseEmbeddings {
      constructor(configuration) {
        super();
        this.configuration = configuration;
        if (!this.configuration)
          this.configuration = {};
        if (!this.configuration.model)
          this.configuration.model = "text-embedding-3-small";
        if (!this.configuration.dimensions) {
          if (this.configuration.model === "text-embedding-3-small") {
            this.configuration.dimensions = 1536;
          } else if (this.configuration.model === "text-embedding-3-large") {
            this.configuration.dimensions = 3072;
          } else if (this.configuration.model === "text-embedding-ada-002") {
            this.configuration.dimensions = 1536;
          } else {
            throw new Error("You need to pass in the optional dimensions parameter for this model");
          }
        }
        this.model = new LangchainAzureOpenAiEmbeddings(this.configuration);
      }
      model;
      async getDimensions() {
        return this.configuration.dimensions;
      }
      async embedDocuments(texts) {
        return this.model.embedDocuments(texts);
      }
      async embedQuery(text) {
        return this.model.embedQuery(text);
      }
    };
  }
});

// models/embedjs-openai/src/openai-embeddings.ts
import { OpenAIEmbeddings } from "@langchain/openai";
var OpenAiEmbeddings;
var init_openai_embeddings = __esm({
  "models/embedjs-openai/src/openai-embeddings.ts"() {
    init_src();
    OpenAiEmbeddings = class extends BaseEmbeddings {
      constructor(configuration) {
        super();
        this.configuration = configuration;
        if (!this.configuration)
          this.configuration = {};
        if (!this.configuration.model)
          this.configuration.model = "text-embedding-3-small";
        if (!this.configuration.dimensions) {
          if (this.configuration.model === "text-embedding-3-small") {
            this.configuration.dimensions = 1536;
          } else if (this.configuration.model === "text-embedding-3-large") {
            this.configuration.dimensions = 3072;
          } else if (this.configuration.model === "text-embedding-ada-002") {
            this.configuration.dimensions = 1536;
          } else {
            throw new Error("You need to pass in the optional dimensions parameter for this model");
          }
        }
        this.model = new OpenAIEmbeddings(this.configuration);
      }
      model;
      async getDimensions() {
        return this.configuration.dimensions;
      }
      async embedDocuments(texts) {
        return this.model.embedDocuments(texts);
      }
      async embedQuery(text) {
        return this.model.embedQuery(text);
      }
    };
  }
});

// models/embedjs-openai/src/index.ts
var src_exports = {};
__export(src_exports, {
  AzureOpenAi: () => AzureOpenAi,
  AzureOpenAiEmbeddings: () => AzureOpenAiEmbeddings,
  OpenAi: () => OpenAi,
  OpenAiEmbeddings: () => OpenAiEmbeddings
});
var init_src3 = __esm({
  "models/embedjs-openai/src/index.ts"() {
    init_openai_model();
    init_azure_openai_model();
    init_azure_openai_embeddings();
    init_openai_embeddings();
  }
});

// loaders/embedjs-loader-msoffice/src/docx-loader.ts
import { RecursiveCharacterTextSplitter as RecursiveCharacterTextSplitter2 } from "@langchain/textsplitters";
import { getTextExtractor } from "office-text-extractor";
import md53 from "md5";
var DocxLoader;
var init_docx_loader = __esm({
  "loaders/embedjs-loader-msoffice/src/docx-loader.ts"() {
    init_src();
    init_src2();
    DocxLoader = class extends BaseLoader {
      filePathOrUrl;
      isUrl;
      constructor({
        filePathOrUrl,
        chunkOverlap,
        chunkSize
      }) {
        super(`DocxLoader_${md53(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1e3, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
      }
      async *getUnfilteredChunks() {
        const chunker = new RecursiveCharacterTextSplitter2({
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap
        });
        const extractor = getTextExtractor();
        const docxParsed = await extractor.extractText({
          input: this.filePathOrUrl,
          type: this.isUrl ? "url" : "file"
        });
        const chunks = await chunker.splitText(cleanString(docxParsed));
        for (const chunk of chunks) {
          yield {
            pageContent: chunk,
            metadata: {
              type: "DocxLoader",
              source: this.filePathOrUrl
            }
          };
        }
      }
    };
  }
});

// loaders/embedjs-loader-msoffice/src/excel-loader.ts
import { RecursiveCharacterTextSplitter as RecursiveCharacterTextSplitter3 } from "@langchain/textsplitters";
import { getTextExtractor as getTextExtractor2 } from "office-text-extractor";
import md54 from "md5";
var ExcelLoader;
var init_excel_loader = __esm({
  "loaders/embedjs-loader-msoffice/src/excel-loader.ts"() {
    init_src();
    init_src2();
    ExcelLoader = class extends BaseLoader {
      filePathOrUrl;
      isUrl;
      constructor({
        filePathOrUrl,
        chunkOverlap,
        chunkSize
      }) {
        super(`ExcelLoader_${md54(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1e3, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
      }
      async *getUnfilteredChunks() {
        const chunker = new RecursiveCharacterTextSplitter3({
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap
        });
        const extractor = getTextExtractor2();
        const xlsxParsed = await extractor.extractText({
          input: this.filePathOrUrl,
          type: this.isUrl ? "url" : "file"
        });
        const chunks = await chunker.splitText(cleanString(xlsxParsed));
        for (const chunk of chunks) {
          yield {
            pageContent: chunk,
            metadata: {
              type: "ExcelLoader",
              source: this.filePathOrUrl
            }
          };
        }
      }
    };
  }
});

// loaders/embedjs-loader-msoffice/src/ppt-loader.ts
import { RecursiveCharacterTextSplitter as RecursiveCharacterTextSplitter4 } from "@langchain/textsplitters";
import { getTextExtractor as getTextExtractor3 } from "office-text-extractor";
import md55 from "md5";
var PptLoader;
var init_ppt_loader = __esm({
  "loaders/embedjs-loader-msoffice/src/ppt-loader.ts"() {
    init_src();
    init_src2();
    PptLoader = class extends BaseLoader {
      filePathOrUrl;
      isUrl;
      constructor({
        filePathOrUrl,
        chunkOverlap,
        chunkSize
      }) {
        super(`PptLoader_${md55(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1e3, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
      }
      async *getUnfilteredChunks() {
        const chunker = new RecursiveCharacterTextSplitter4({
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap
        });
        const extractor = getTextExtractor3();
        const docxParsed = await extractor.extractText({
          input: this.filePathOrUrl,
          type: this.isUrl ? "url" : "file"
        });
        const chunks = await chunker.splitText(cleanString(docxParsed));
        for (const chunk of chunks) {
          yield {
            pageContent: chunk,
            metadata: {
              type: "PptLoader",
              source: this.filePathOrUrl
            }
          };
        }
      }
    };
  }
});

// loaders/embedjs-loader-msoffice/src/index.ts
var src_exports2 = {};
__export(src_exports2, {
  DocxLoader: () => DocxLoader,
  ExcelLoader: () => ExcelLoader,
  PptLoader: () => PptLoader
});
var init_src4 = __esm({
  "loaders/embedjs-loader-msoffice/src/index.ts"() {
    init_docx_loader();
    init_excel_loader();
    init_ppt_loader();
  }
});

// loaders/embedjs-loader-pdf/src/pdf-loader.ts
import { RecursiveCharacterTextSplitter as RecursiveCharacterTextSplitter5 } from "@langchain/textsplitters";
import { getTextExtractor as getTextExtractor4 } from "office-text-extractor";
import md56 from "md5";
var PdfLoader;
var init_pdf_loader = __esm({
  "loaders/embedjs-loader-pdf/src/pdf-loader.ts"() {
    init_src();
    init_src2();
    PdfLoader = class extends BaseLoader {
      filePathOrUrl;
      isUrl;
      constructor({
        filePathOrUrl,
        chunkOverlap,
        chunkSize
      }) {
        super(`PdfLoader_${md56(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1e3, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
      }
      async *getUnfilteredChunks() {
        const chunker = new RecursiveCharacterTextSplitter5({
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap
        });
        const extractor = getTextExtractor4();
        const pdfParsed = await extractor.extractText({ input: this.filePathOrUrl, type: this.isUrl ? "url" : "file" });
        const chunks = await chunker.splitText(cleanString(pdfParsed));
        for (const chunk of chunks) {
          yield {
            pageContent: chunk,
            metadata: {
              type: "PdfLoader",
              source: this.filePathOrUrl
            }
          };
        }
      }
    };
  }
});

// loaders/embedjs-loader-pdf/src/index.ts
var src_exports3 = {};
__export(src_exports3, {
  PdfLoader: () => PdfLoader
});
var init_src5 = __esm({
  "loaders/embedjs-loader-pdf/src/index.ts"() {
    init_pdf_loader();
  }
});

// loaders/embedjs-loader-csv/src/csv-loader.ts
import { parse } from "csv-parse";
import createDebugMessages7 from "debug";
import fs from "node:fs";
import md57 from "md5";
var CsvLoader;
var init_csv_loader = __esm({
  "loaders/embedjs-loader-csv/src/csv-loader.ts"() {
    init_src();
    init_src2();
    CsvLoader = class extends BaseLoader {
      debug = createDebugMessages7("embedjs:loader:CsvLoader");
      csvParseOptions;
      filePathOrUrl;
      isUrl;
      constructor({
        filePathOrUrl,
        csvParseOptions,
        chunkOverlap,
        chunkSize
      }) {
        super(`CsvLoader_${md57(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1e3, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
        this.csvParseOptions = csvParseOptions ?? { autoParse: true };
      }
      async *getUnfilteredChunks() {
        const buffer = this.isUrl ? (await getSafe(this.filePathOrUrl, { format: "buffer" })).body : await streamToBuffer(fs.createReadStream(this.filePathOrUrl));
        this.debug("CsvParser stream created");
        const parser = parse(buffer, this.csvParseOptions);
        this.debug("CSV parsing started...");
        for await (const record of parser) {
          yield {
            pageContent: cleanString(record.join(",")),
            metadata: {
              type: "CsvLoader",
              source: this.filePathOrUrl
            }
          };
        }
        this.debug(`CsvParser for filePathOrUrl '${this.filePathOrUrl}' finished`);
      }
    };
  }
});

// loaders/embedjs-loader-csv/src/index.ts
var src_exports4 = {};
__export(src_exports4, {
  CsvLoader: () => CsvLoader
});
var init_src6 = __esm({
  "loaders/embedjs-loader-csv/src/index.ts"() {
    init_csv_loader();
  }
});

// loaders/embedjs-loader-web/src/web-loader.ts
import { RecursiveCharacterTextSplitter as RecursiveCharacterTextSplitter6 } from "@langchain/textsplitters";
import createDebugMessages8 from "debug";
import { convert } from "html-to-text";
import md58 from "md5";
var WebLoader;
var init_web_loader = __esm({
  "loaders/embedjs-loader-web/src/web-loader.ts"() {
    init_src();
    init_src2();
    WebLoader = class extends BaseLoader {
      debug = createDebugMessages8("embedjs:loader:WebLoader");
      urlOrContent;
      isUrl;
      constructor({
        urlOrContent,
        chunkSize,
        chunkOverlap
      }) {
        super(`WebLoader_${md58(urlOrContent)}`, { urlOrContent }, chunkSize ?? 2e3, chunkOverlap ?? 0);
        this.isUrl = isValidURL(urlOrContent) ? true : false;
        this.urlOrContent = urlOrContent;
      }
      async *getUnfilteredChunks() {
        const chunker = new RecursiveCharacterTextSplitter6({
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap
        });
        try {
          const data = this.isUrl ? (await getSafe(this.urlOrContent, { format: "text" })).body : this.urlOrContent;
          const text = convert(data, {
            wordwrap: false,
            preserveNewlines: false
          }).replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
          const tuncatedObjectString = this.isUrl ? void 0 : truncateCenterString(this.urlOrContent, 50);
          const chunks = await chunker.splitText(cleanString(text));
          for (const chunk of chunks) {
            yield {
              pageContent: chunk,
              metadata: {
                type: "WebLoader",
                source: this.isUrl ? this.urlOrContent : tuncatedObjectString
              }
            };
          }
        } catch (e) {
          this.debug("Could not parse input", this.urlOrContent, e);
        }
      }
    };
  }
});

// loaders/embedjs-loader-web/src/index.ts
var src_exports5 = {};
__export(src_exports5, {
  WebLoader: () => WebLoader
});
var init_src7 = __esm({
  "loaders/embedjs-loader-web/src/index.ts"() {
    init_web_loader();
  }
});

// loaders/embedjs-loader-sitemap/src/sitemap-loader.ts
import md59 from "md5";
import Sitemapper from "sitemapper";
import createDebugMessages9 from "debug";
var SitemapLoader;
var init_sitemap_loader = __esm({
  "loaders/embedjs-loader-sitemap/src/sitemap-loader.ts"() {
    init_src();
    init_src7();
    SitemapLoader = class extends BaseLoader {
      static async test(url) {
        try {
          await new Sitemapper({ url, timeout: 15e3 }).fetch();
          return true;
        } catch {
          return false;
        }
      }
      debug = createDebugMessages9("embedjs:loader:SitemapLoader");
      url;
      constructor({ url, chunkSize, chunkOverlap }) {
        super(`SitemapLoader_${md59(url)}`, { url }, chunkSize ?? 2e3, chunkOverlap);
        this.url = url;
      }
      async *getUnfilteredChunks() {
        try {
          const { sites } = await new Sitemapper({ url: this.url, timeout: 15e3 }).fetch();
          this.debug(`Sitemap '${this.url}' returned ${sites.length} URLs`);
          for (const url of sites) {
            const webLoader = new WebLoader({
              urlOrContent: url,
              chunkSize: this.chunkSize,
              chunkOverlap: this.chunkOverlap
            });
            for await (const chunk of webLoader.getUnfilteredChunks()) {
              yield {
                ...chunk,
                metadata: {
                  ...chunk.metadata,
                  type: "SitemapLoader",
                  originalSource: this.url
                }
              };
            }
          }
        } catch (e) {
          this.debug("Could not get sites from sitemap url", this.url, e);
        }
      }
    };
  }
});

// loaders/embedjs-loader-sitemap/src/index.ts
var src_exports6 = {};
__export(src_exports6, {
  SitemapLoader: () => SitemapLoader
});
var init_src8 = __esm({
  "loaders/embedjs-loader-sitemap/src/index.ts"() {
    init_sitemap_loader();
  }
});

// loaders/embedjs-loader-xml/src/xml-loader.ts
import { XMLParser } from "fast-xml-parser";
import createDebugMessages10 from "debug";
import fs2 from "node:fs";
import md510 from "md5";
var XmlLoader;
var init_xml_loader = __esm({
  "loaders/embedjs-loader-xml/src/xml-loader.ts"() {
    init_src();
    init_src2();
    XmlLoader = class extends BaseLoader {
      debug = createDebugMessages10("embedjs:loader:XmlLoader");
      xmlParseOptions;
      filePathOrUrl;
      isUrl;
      constructor({
        filePathOrUrl,
        xmlParseOptions,
        chunkOverlap,
        chunkSize
      }) {
        super(`XmlLoader_${md510(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1e3, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
        this.xmlParseOptions = xmlParseOptions;
      }
      async *getUnfilteredChunks() {
        const buffer = this.isUrl ? (await getSafe(this.filePathOrUrl, { format: "buffer" })).body : await streamToBuffer(fs2.createReadStream(this.filePathOrUrl));
        this.debug("XmlLoader stream created");
        const parsed = new XMLParser(this.xmlParseOptions).parse(buffer);
        this.debug("XML data parsed");
        const array = Array.isArray(parsed) ? parsed : [parsed];
        for (const entry of array) {
          const str = cleanString(JSON.stringify(entry));
          if ("id" in entry) {
            entry.preEmbedId = entry.id;
            delete entry.id;
          }
          yield {
            pageContent: str,
            metadata: {
              type: "XmlLoader",
              source: this.filePathOrUrl
            }
          };
        }
        this.debug(`XmlLoader for filePathOrUrl '${this.filePathOrUrl}' finished`);
      }
    };
  }
});

// loaders/embedjs-loader-xml/src/index.ts
var src_exports7 = {};
__export(src_exports7, {
  XmlLoader: () => XmlLoader
});
var init_src9 = __esm({
  "loaders/embedjs-loader-xml/src/index.ts"() {
    init_xml_loader();
  }
});

// loaders/embedjs-loader-markdown/src/markdown-loader.ts
import { micromark } from "micromark";
import { mdxJsx } from "micromark-extension-mdx-jsx";
import { gfmHtml, gfm } from "micromark-extension-gfm";
import createDebugMessages11 from "debug";
import fs3 from "node:fs";
import md511 from "md5";
var MarkdownLoader;
var init_markdown_loader = __esm({
  "loaders/embedjs-loader-markdown/src/markdown-loader.ts"() {
    init_src();
    init_src2();
    init_src7();
    MarkdownLoader = class extends BaseLoader {
      debug = createDebugMessages11("embedjs:loader:MarkdownLoader");
      filePathOrUrl;
      isUrl;
      constructor({
        filePathOrUrl,
        chunkOverlap,
        chunkSize
      }) {
        super(`MarkdownLoader_${md511(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1e3, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
      }
      async *getUnfilteredChunks() {
        const buffer = this.isUrl ? (await getSafe(this.filePathOrUrl, { format: "buffer" })).body : await streamToBuffer(fs3.createReadStream(this.filePathOrUrl));
        this.debug("MarkdownLoader stream created");
        const result = micromark(buffer, { extensions: [gfm(), mdxJsx()], htmlExtensions: [gfmHtml()] });
        this.debug("Markdown parsed...");
        const webLoader = new WebLoader({
          urlOrContent: result,
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap
        });
        for await (const result2 of await webLoader.getUnfilteredChunks()) {
          result2.pageContent = result2.pageContent.replace(/[\[\]\(\)\{\}]/g, "");
          yield {
            pageContent: result2.pageContent,
            metadata: {
              type: "MarkdownLoader",
              source: this.filePathOrUrl
            }
          };
        }
        this.debug(`MarkdownLoader for filePathOrUrl '${this.filePathOrUrl}' finished`);
      }
    };
  }
});

// loaders/embedjs-loader-markdown/src/index.ts
var src_exports8 = {};
__export(src_exports8, {
  MarkdownLoader: () => MarkdownLoader
});
var init_src10 = __esm({
  "loaders/embedjs-loader-markdown/src/index.ts"() {
    init_markdown_loader();
  }
});

// loaders/embedjs-loader-image/src/image-loader.ts
import { HumanMessage as HumanMessage2 } from "@langchain/core/messages";
import { getMimeType } from "stream-mime-type";
import createDebugMessages12 from "debug";
import exifremove from "exifremove";
import fs4 from "node:fs";
import md512 from "md5";
var ImageLoader;
var init_image_loader = __esm({
  "loaders/embedjs-loader-image/src/image-loader.ts"() {
    init_src();
    init_src2();
    ImageLoader = class extends BaseLoader {
      debug = createDebugMessages12("embedjs:loader:ImageLoader");
      filePathOrUrl;
      isUrl;
      captionModel;
      mime;
      constructor({
        filePathOrUrl,
        captionModel,
        mime: mime2
      }) {
        super(`ImageLoader_${md512(filePathOrUrl)}`, { filePathOrUrl }, 1e5, 300);
        this.mime = mime2;
        this.captionModel = captionModel;
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
      }
      injectModel(model) {
        if (!this.captionModel) {
          this.captionModel = model;
        }
      }
      async *getUnfilteredChunks() {
        if (!this.captionModel)
          throw new Error("No model available to describe image");
        if (!this.mime) {
          this.debug("Mime type not provided; starting auto-detect");
          if (this.isUrl) {
            const response2 = await getSafe(this.filePathOrUrl, { headers: { "Accept-Encoding": "" } });
            const stream = response2.body;
            this.mime = (await getMimeType(stream, { strict: true })).mime;
            if (!this.mime) {
              this.mime = contentTypeToMimeType(response2.headers.get("content-type"));
              this.debug(`Using type '${this.mime}' from content-type header`);
            }
          } else {
            const stream = fs4.createReadStream(this.filePathOrUrl);
            this.mime = (await getMimeType(stream)).mime;
            stream.destroy();
          }
        }
        this.debug(`Image stream detected type '${this.mime}'`);
        const buffer = this.isUrl ? (await getSafe(this.filePathOrUrl, { format: "buffer" })).body : await streamToBuffer(fs4.createReadStream(this.filePathOrUrl));
        const plainImageBuffer = exifremove.remove(buffer);
        const message = new HumanMessage2({
          content: [
            {
              type: "text",
              text: "what does this image contain?"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${this.mime};base64,${plainImageBuffer.toString("base64")}`
              }
            }
          ]
        });
        this.debug("Asking LLM to describe image");
        const response = await this.captionModel.simpleQuery([message]);
        this.debug("LLM describes image as: ", response.result);
        yield {
          pageContent: cleanString(response.result),
          metadata: {
            type: "ImageLoader",
            source: this.filePathOrUrl
          }
        };
        this.debug(`Loaded image details for filePathOrUrl '${this.filePathOrUrl}'`);
      }
    };
  }
});

// loaders/embedjs-loader-image/src/index.ts
var src_exports9 = {};
__export(src_exports9, {
  ImageLoader: () => ImageLoader
});
var init_src11 = __esm({
  "loaders/embedjs-loader-image/src/index.ts"() {
    init_image_loader();
  }
});

// examples/dynamic/src/main.ts
import "dotenv/config";

// core/embedjs/src/core/rag-application.ts
init_src();
init_src2();
import createDebugMessages6 from "debug";
var RAGApplication = class {
  debug = createDebugMessages6("embedjs:core");
  storeConversationsToDefaultThread;
  embeddingRelevanceCutOff;
  searchResultCount;
  systemMessage;
  vectorDatabase;
  embeddingModel;
  store;
  loaders;
  model;
  constructor(llmBuilder) {
    if (!llmBuilder.getEmbeddingModel())
      throw new Error("Embedding model must be set!");
    this.embeddingModel = llmBuilder.getEmbeddingModel();
    this.storeConversationsToDefaultThread = llmBuilder.getParamStoreConversationsToDefaultThread();
    this.store = llmBuilder.getStore();
    BaseLoader.setCache(this.store);
    BaseModel.setStore(this.store);
    this.systemMessage = cleanString(llmBuilder.getSystemMessage());
    this.debug(`Using system query template - "${this.systemMessage}"`);
    this.vectorDatabase = llmBuilder.getVectorDatabase();
    if (!this.vectorDatabase)
      throw new SyntaxError("vectorDatabase not set");
    this.searchResultCount = llmBuilder.getSearchResultCount();
    this.embeddingRelevanceCutOff = llmBuilder.getEmbeddingRelevanceCutOff();
  }
  /**
   * The function initializes various components of a language model using provided configurations
   * and data. This is an internal method and does not need to be invoked manually.
   * @param {RAGApplicationBuilder} llmBuilder - The `llmBuilder` parameter in the `init` function is
   * an instance of the `RAGApplicationBuilder` class. It is used to build and configure a Language
   * Model (LLM) for a conversational AI system. The function initializes various components of the
   * LLM based on the configuration provided
   */
  async init(llmBuilder) {
    await this.embeddingModel.init();
    this.model = await this.getModel(llmBuilder.getModel());
    if (!this.model)
      this.debug("No base model set; query function unavailable!");
    else
      BaseModel.setDefaultTemperature(llmBuilder.getTemperature());
    this.loaders = llmBuilder.getLoaders();
    if (this.model) {
      await this.model.init();
      this.debug("Initialized LLM class");
    }
    await this.vectorDatabase.init({ dimensions: await this.embeddingModel.getDimensions() });
    this.debug("Initialized vector database");
    if (this.store) {
      await this.store.init();
      this.debug("Initialized cache");
    }
    this.loaders = getUnique(this.loaders, "getUniqueId");
    for await (const loader of this.loaders) {
      await this.addLoader(loader);
    }
    this.debug("Initialized pre-loaders");
  }
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
  async getModel(model) {
    if (typeof model === "object")
      return model;
    else if (model === null)
      return null;
    else {
      const { OpenAi: OpenAi2 } = await Promise.resolve().then(() => (init_src3(), src_exports)).catch(() => {
        throw new Error("Package `@llm-tools/embedjs-openai` needs to be installed to use OpenAI models");
      });
      this.debug("Dynamically imported OpenAi");
      if (model === 2 /* OPENAI_GPT4_O */)
        return new OpenAi2({ modelName: "gpt-4o" });
      else if (model === 1 /* OPENAI_GPT4_TURBO */)
        return new OpenAi2({ modelName: "gpt-4-turbo" });
      else if (model === 0 /* OPENAI_GPT3.5_TURBO */)
        return new OpenAi2({ modelName: "gpt-3.5-turbo" });
      else
        throw new Error("Invalid model name");
    }
  }
  /**
   * The function `embedChunks` embeds the content of chunks by invoking the planned embedding model.
   * @param {Pick<Chunk, 'pageContent'>[]} chunks - The `chunks` parameter is an array of objects
   * that have a property `pageContent` which contains text content for each chunk.
   * @returns The `embedChunks` function is returning the embedded vectors for the chunks.
   */
  async embedChunks(chunks) {
    const texts = chunks.map(({ pageContent }) => pageContent);
    return this.embeddingModel.embedDocuments(texts);
  }
  /**
   * The function `getChunkUniqueId` generates a unique identifier by combining a loader unique ID and
   * an increment ID.
   * @param {string} loaderUniqueId - A unique identifier for the loader.
   * @param {number} incrementId - The `incrementId` parameter is a number that represents the
   * increment value used to generate a unique chunk identifier.
   * @returns The function `getChunkUniqueId` returns a string that combines the `loaderUniqueId` and
   * `incrementId`.
   */
  getChunkUniqueId(loaderUniqueId, incrementId) {
    return `${loaderUniqueId}_${incrementId}`;
  }
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
  async addLoader(loaderParam, forceReload = false) {
    return this._addLoader(loaderParam, forceReload);
  }
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
  async _addLoader(loader, forceReload) {
    const uniqueId = loader.getUniqueId();
    this.debug("Exploring loader", uniqueId);
    if (this.model)
      loader.injectModel(this.model);
    if (this.store && await this.store.hasLoaderMetadata(uniqueId)) {
      if (forceReload) {
        const { chunksProcessed } = await this.store.getLoaderMetadata(uniqueId);
        this.debug(
          `Loader previously run but forceReload set! Deleting previous ${chunksProcessed} keys...`,
          uniqueId
        );
        this.loaders = this.loaders.filter((x) => x.getUniqueId() != loader.getUniqueId());
        if (chunksProcessed > 0)
          await this.deleteLoader(uniqueId);
      } else {
        this.debug("Loader previously run. Skipping...", uniqueId);
        return { entriesAdded: 0, uniqueId, loaderType: loader.constructor.name };
      }
    }
    await loader.init();
    const chunks = await loader.getChunks();
    this.debug("Chunks generator received", uniqueId);
    const { newInserts } = await this.batchLoadChunks(uniqueId, chunks);
    this.debug(`Add loader completed with ${newInserts} new entries for`, uniqueId);
    if (loader.canIncrementallyLoad) {
      this.debug(`Registering incremental loader`, uniqueId);
      loader.on("incrementalChunkAvailable", async (incrementalGenerator) => {
        await this.incrementalLoader(uniqueId, incrementalGenerator);
      });
    }
    this.loaders.push(loader);
    this.debug(`Add loader ${uniqueId} wrap up done`);
    return { entriesAdded: newInserts, uniqueId, loaderType: loader.constructor.name };
  }
  /**
   * The `incrementalLoader` function asynchronously processes incremental chunks for a loader.
   * @param {string} uniqueId - The `uniqueId` parameter is a string that serves as an identifier for
   * the loader.
   * @param incrementalGenerator - The `incrementalGenerator` parameter is an asynchronous generator
   * function that yields `LoaderChunk` objects. It is used to incrementally load chunks of data for a specific loader
   */
  async incrementalLoader(uniqueId, incrementalGenerator) {
    this.debug(`incrementalChunkAvailable for loader`, uniqueId);
    const { newInserts } = await this.batchLoadChunks(uniqueId, incrementalGenerator);
    this.debug(`${newInserts} new incrementalChunks processed`, uniqueId);
  }
  /**
   * The function `getLoaders` asynchronously retrieves a list of loaders loaded so far. This includes
   * internal loaders that were loaded by other loaders. It requires that cache is enabled to work.
   * @returns The list of loaders with some metadata about them.
   */
  async getLoaders() {
    if (!this.store)
      return [];
    return this.store.getAllLoaderMetadata();
  }
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
  async batchLoadChunks(uniqueId, generator) {
    let i = 0, batchSize = 0, newInserts = 0, formattedChunks = [];
    for await (const chunk of generator) {
      batchSize++;
      const formattedChunk = {
        pageContent: chunk.pageContent,
        metadata: {
          ...chunk.metadata,
          uniqueLoaderId: uniqueId,
          id: this.getChunkUniqueId(uniqueId, i++)
        }
      };
      formattedChunks.push(formattedChunk);
      if (batchSize % DEFAULT_INSERT_BATCH_SIZE === 0) {
        newInserts += await this.batchLoadEmbeddings(uniqueId, formattedChunks);
        formattedChunks = [];
        batchSize = 0;
      }
    }
    newInserts += await this.batchLoadEmbeddings(uniqueId, formattedChunks);
    return { newInserts, formattedChunks };
  }
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
  async batchLoadEmbeddings(loaderUniqueId, formattedChunks) {
    if (formattedChunks.length === 0)
      return 0;
    this.debug(`Processing batch (size ${formattedChunks.length}) for loader ${loaderUniqueId}`);
    const embeddings = await this.embedChunks(formattedChunks);
    this.debug(`Batch embeddings (size ${formattedChunks.length}) obtained for loader ${loaderUniqueId}`);
    const embedChunks = formattedChunks.map((chunk, index) => {
      return {
        pageContent: chunk.pageContent,
        vector: embeddings[index],
        metadata: chunk.metadata
      };
    });
    this.debug(`Inserting chunks for loader ${loaderUniqueId} to vectorDatabase`);
    return this.vectorDatabase.insertChunks(embedChunks);
  }
  /**
   * The function `getEmbeddingsCount` returns the count of embeddings stored in a vector database
   * asynchronously.
   * @returns The `getEmbeddingsCount` method is returning the number of embeddings stored in the
   * vector database. It is an asynchronous function that returns a Promise with the count of
   * embeddings as a number.
   */
  async getEmbeddingsCount() {
    return this.vectorDatabase.getVectorCount();
  }
  /**
   * The function `deleteConversation` deletes all entries related to a particular conversation from the database
   * @param {string} conversationId - The `conversationId` that you want to delete. Pass 'default' to delete
   * the default conversation thread that is created and maintained automatically
   */
  async deleteConversation(conversationId) {
    if (this.store) {
      await this.store.deleteConversation(conversationId);
    }
  }
  /**
   * The function `deleteLoader` deletes embeddings from a loader after confirming the action.
   * @param {string} uniqueLoaderId - The `uniqueLoaderId` parameter is a string that represents the
   * identifier of the loader that you want to delete.
   * @returns The `deleteLoader` method returns a boolean value indicating the success of the operation.
   */
  async deleteLoader(uniqueLoaderId) {
    const deleteResult = await this.vectorDatabase.deleteKeys(uniqueLoaderId);
    if (this.store && deleteResult)
      await this.store.deleteLoaderMetadataAndCustomValues(uniqueLoaderId);
    this.loaders = this.loaders.filter((x) => x.getUniqueId() != uniqueLoaderId);
    return deleteResult;
  }
  /**
   * The function `reset` deletes all embeddings from the vector database if a
   * confirmation is provided.
   * @returns The `reset` function returns a boolean value indicating the result.
   */
  async reset() {
    await this.vectorDatabase.reset();
    return true;
  }
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
  async getEmbeddings(cleanQuery, limitsPerDoc) {
    const queryEmbedded = await this.embeddingModel.embedQuery(cleanQuery);
    const unfilteredResultSet = await this.vectorDatabase.similaritySearch(
      queryEmbedded,
      this.searchResultCount + 10,
      limitsPerDoc
    );
    this.debug(`Query resulted in ${unfilteredResultSet.length} chunks before filteration...`);
    return unfilteredResultSet.filter((result) => result.score > this.embeddingRelevanceCutOff).sort((a, b) => b.score - a.score).slice(0, this.searchResultCount);
  }
  /**
   * The `search` function retrieves the unique embeddings for a given query without calling a LLM.
   * @param {string} query - The `query` parameter is a string that represents the input query that
   * needs to be processed.
   * @returns An array of unique page content items / chunks.
   */
  async search(query, limitsPerDoc) {
    const cleanQuery = cleanString(query);
    const rawContext = await this.getEmbeddings(cleanQuery, limitsPerDoc);
    return [...new Map(rawContext.map((item) => [item.pageContent, item])).values()];
  }
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
  async query(userQuery, options) {
    if (!this.model) {
      throw new Error("LLM Not set; query method not available");
    }
    let context = options?.customContext;
    if (!context)
      context = await this.search(userQuery);
    let conversationId = options?.conversationId;
    if (!conversationId && this.storeConversationsToDefaultThread) {
      conversationId = "default";
    }
    const sources = [...new Set(context.map((chunk) => chunk.metadata.source))];
    this.debug(
      `Query resulted in ${context.length} chunks after filteration; chunks from ${sources.length} unique sources.`
    );
    return this.model.query(
      this.systemMessage,
      userQuery,
      context,
      conversationId,
      options?.limitConversation,
      options?.callback,
      options?.estimateTokens
    );
  }
};

// core/embedjs/src/core/rag-application-builder.ts
init_src();

// core/embedjs/src/store/memory-store.ts
var MemoryStore = class {
  loaderCustomValues;
  loaderCustomValuesMap;
  loaderList;
  conversations;
  async init() {
    this.loaderList = {};
    this.loaderCustomValues = {};
    this.conversations = /* @__PURE__ */ new Map();
    this.loaderCustomValuesMap = /* @__PURE__ */ new Map();
  }
  async addLoaderMetadata(loaderId, value) {
    this.loaderList[loaderId] = value;
  }
  async getLoaderMetadata(loaderId) {
    return this.loaderList[loaderId];
  }
  async hasLoaderMetadata(loaderId) {
    return !!this.loaderList[loaderId];
  }
  async getAllLoaderMetadata() {
    return Object.values(this.loaderList);
  }
  async loaderCustomSet(loaderId, key, value) {
    if (!this.loaderCustomValuesMap.has(loaderId))
      this.loaderCustomValuesMap.set(loaderId, []);
    this.loaderCustomValuesMap.get(loaderId).push(key);
    this.loaderCustomValues[key] = { ...value, loaderId };
  }
  async loaderCustomGet(key) {
    const data = this.loaderCustomValues[key];
    delete data.loaderId;
    return data;
  }
  async loaderCustomHas(key) {
    return !!this.loaderCustomValues[key];
  }
  async loaderCustomDelete(key) {
    const loaderId = this.loaderCustomValues[key].loaderId;
    delete this.loaderList[key];
    if (this.loaderCustomValuesMap.has(loaderId)) {
      this.loaderCustomValuesMap.set(
        loaderId,
        this.loaderCustomValuesMap.get(loaderId).filter((k) => k !== key)
      );
    }
  }
  async deleteLoaderMetadataAndCustomValues(loaderId) {
    if (this.loaderCustomValuesMap.has(loaderId)) {
      this.loaderCustomValuesMap.get(loaderId).forEach((key) => {
        delete this.loaderCustomValues[key];
      });
    }
    this.loaderCustomValuesMap.delete(loaderId);
    delete this.loaderList[loaderId];
  }
  async addConversation(conversationId) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, { conversationId, entries: [] });
    }
  }
  async getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }
  async hasConversation(conversationId) {
    return this.conversations.has(conversationId);
  }
  async deleteConversation(conversationId) {
    this.conversations.delete(conversationId);
  }
  async addEntryToConversation(conversationId, entry) {
    const conversation = await this.getConversation(conversationId);
    conversation.entries.push(entry);
  }
  async clearConversations() {
    this.conversations.clear();
  }
};

// core/embedjs/src/core/rag-application-builder.ts
var RAGApplicationBuilder = class {
  temperature;
  model;
  vectorDatabase;
  loaders;
  store;
  systemMessage;
  searchResultCount;
  embeddingModel;
  embeddingRelevanceCutOff;
  storeConversationsToDefaultThread;
  constructor() {
    this.loaders = [];
    this.temperature = 0.1;
    this.searchResultCount = 30;
    this.model = 1 /* OPENAI_GPT4_TURBO */;
    this.systemMessage = `You are a helpful human like chat bot. Use relevant provided context and chat history to answer the query at the end. Answer in full.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.

        Do not use words like context or training data when responding. You can say you do not have all the information but do not indicate that you are not a reliable source.`;
    this.storeConversationsToDefaultThread = true;
    this.embeddingRelevanceCutOff = 0;
    this.store = new MemoryStore();
  }
  /**
   * The `build` function creates a new `RAGApplication` entity and initializes it asynchronously based on provided parameters.
   * @returns An instance of the `RAGApplication` class after it has been initialized asynchronously.
   */
  async build() {
    const entity = new RAGApplication(this);
    await entity.init(this);
    return entity;
  }
  /**
   * The function setVectorDatabase sets a BaseVectorDatabase object
   * @param {BaseVectorDatabase} vectorDatabase - The `vectorDatabase` parameter is an instance of the `BaseVectorDatabase` class, which
   * is used to store vectors in a database.
   * @returns The `this` object is being returned, which allows for method chaining.
   */
  setVectorDatabase(vectorDatabase) {
    this.vectorDatabase = vectorDatabase;
    return this;
  }
  setEmbeddingModel(embeddingModel) {
    this.embeddingModel = embeddingModel;
    return this;
  }
  setModel(model) {
    if (typeof model === "object")
      this.model = model;
    else {
      if (model === "NO_MODEL")
        this.model = null;
      else
        this.model = model;
    }
    return this;
  }
  setStore(store) {
    this.store = store;
    return this;
  }
  setTemperature(temperature) {
    this.temperature = temperature;
    if (this.model)
      this.setModel(this.model);
    return this;
  }
  setSystemMessage(systemMessage) {
    this.systemMessage = systemMessage;
    return this;
  }
  setEmbeddingRelevanceCutOff(embeddingRelevanceCutOff) {
    this.embeddingRelevanceCutOff = embeddingRelevanceCutOff;
    return this;
  }
  addLoader(loader) {
    this.loaders.push(loader);
    return this;
  }
  /**
   * The setSearchResultCount function sets the search result count
   * @param {number} searchResultCount - The `searchResultCount` parameter
   * represents the count of search results picked up from the vector store per query.
   * @returns The `this` object is being returned, which allows for method chaining.
   */
  setSearchResultCount(searchResultCount) {
    this.searchResultCount = searchResultCount;
    return this;
  }
  /**
   * The setParamStoreConversationsToDefaultThread configures whether the conversation hisotry for queries made
   * without a conversationId passed should be stored in the default thread. This is set to True by default.
   */
  setParamStoreConversationsToDefaultThread(storeConversationsToDefaultThread) {
    this.storeConversationsToDefaultThread = storeConversationsToDefaultThread;
    return this;
  }
  getLoaders() {
    return this.loaders;
  }
  getSearchResultCount() {
    return this.searchResultCount;
  }
  getVectorDatabase() {
    return this.vectorDatabase;
  }
  getTemperature() {
    return this.temperature;
  }
  getEmbeddingRelevanceCutOff() {
    return this.embeddingRelevanceCutOff;
  }
  getSystemMessage() {
    return this.systemMessage;
  }
  getStore() {
    return this.store;
  }
  getEmbeddingModel() {
    return this.embeddingModel;
  }
  getModel() {
    return this.model;
  }
  getParamStoreConversationsToDefaultThread() {
    return this.storeConversationsToDefaultThread;
  }
};

// core/embedjs/src/loaders/local-path-loader.ts
import { getMimeType as getMimeType2 } from "stream-mime-type";
import createDebugMessages14 from "debug";
import md513 from "md5";

// core/embedjs/src/util/mime.ts
import mime from "mime";
import createDebugMessages13 from "debug";

// core/embedjs/src/loaders/text-loader.ts
init_src();
init_src2();
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import md52 from "md5";
function returnTagID(fullStr, strLen) {
  let parts = fullStr.split(" ");
  if (parts.length > 1) {
    return parts[0];
  } else {
    if (fullStr.length <= strLen)
      return fullStr;
    return fullStr.substring(0, strLen);
  }
}
var TextLoader = class extends BaseLoader {
  text;
  constructor({
    text,
    chunkSize,
    chunkOverlap,
    middleId
  }) {
    if (middleId) {
      let id = `TextLoader_${middleId}_${md52(text)}`;
      super(id, { text: returnTagID(text, 50) }, chunkSize ?? 300, chunkOverlap ?? 0);
    } else {
      let id = `TextLoader_${md52(text)}`;
      super(id, { text: truncateCenterString(text, 50) }, chunkSize ?? 300, chunkOverlap ?? 0);
    }
    this.text = text;
  }
  async *getUnfilteredChunks() {
    let tuncatedObjectString;
    if (this.uniqueId.split("_").length > 1) {
      tuncatedObjectString = returnTagID(this.text, 50);
    } else {
      tuncatedObjectString = truncateCenterString(this.text, 50);
    }
    const chunker = new RecursiveCharacterTextSplitter({
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap
    });
    const chunks = await chunker.splitText(cleanString(this.text));
    for (const chunk of chunks) {
      yield {
        pageContent: chunk,
        metadata: {
          type: "TextLoader",
          source: tuncatedObjectString,
          textId: this.uniqueId
        }
      };
    }
  }
};

// core/embedjs/src/util/mime.ts
async function createLoaderFromMimeType(loaderData, mimeType) {
  createDebugMessages13("embedjs:util:createLoaderFromMimeType")(`Incoming mime type '${mimeType}'`);
  switch (mimeType) {
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const { DocxLoader: DocxLoader2 } = await Promise.resolve().then(() => (init_src4(), src_exports2)).catch(() => {
        throw new Error(
          "Package `@llm-tools/embedjs-loader-msoffice` needs to be installed to load docx files"
        );
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported DocxLoader");
      return new DocxLoader2({ filePathOrUrl: loaderData });
    }
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      const { ExcelLoader: ExcelLoader2 } = await Promise.resolve().then(() => (init_src4(), src_exports2)).catch(() => {
        throw new Error(
          "Package `@llm-tools/embedjs-loader-msoffice` needs to be installed to load excel files"
        );
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported ExcelLoader");
      return new ExcelLoader2({ filePathOrUrl: loaderData });
    }
    case "application/pdf": {
      const { PdfLoader: PdfLoader2 } = await Promise.resolve().then(() => (init_src5(), src_exports3)).catch(() => {
        throw new Error("Package `@llm-tools/embedjs-loader-pdf` needs to be installed to load PDF files");
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported PdfLoader");
      return new PdfLoader2({ filePathOrUrl: loaderData });
    }
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
      const { PptLoader: PptLoader2 } = await Promise.resolve().then(() => (init_src4(), src_exports2)).catch(() => {
        throw new Error(
          "Package `@llm-tools/embedjs-loader-msoffice` needs to be installed to load pptx files"
        );
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported PptLoader");
      return new PptLoader2({ filePathOrUrl: loaderData });
    }
    case "text/plain": {
      const fineType = mime.getType(loaderData);
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")(
        `Fine type for '${loaderData}' is '${fineType}'`
      );
      if (fineType === "text/csv") {
        const { CsvLoader: CsvLoader2 } = await Promise.resolve().then(() => (init_src6(), src_exports4)).catch(() => {
          throw new Error("Package `@llm-tools/embedjs-loader-csv` needs to be installed to load CSV files");
        });
        createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported CsvLoader");
        return new CsvLoader2({ filePathOrUrl: loaderData });
      } else
        return new TextLoader({ text: loaderData });
    }
    case "application/csv": {
      const { CsvLoader: CsvLoader2 } = await Promise.resolve().then(() => (init_src6(), src_exports4)).catch(() => {
        throw new Error("Package `@llm-tools/embedjs-loader-csv` needs to be installed to load CSV files");
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported CsvLoader");
      return new CsvLoader2({ filePathOrUrl: loaderData });
    }
    case "text/html": {
      const { WebLoader: WebLoader2 } = await Promise.resolve().then(() => (init_src7(), src_exports5)).catch(() => {
        throw new Error("Package `@llm-tools/embedjs-loader-web` needs to be installed to load web documents");
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported WebLoader");
      return new WebLoader2({ urlOrContent: loaderData });
    }
    case "text/xml": {
      const { SitemapLoader: SitemapLoader2 } = await Promise.resolve().then(() => (init_src8(), src_exports6)).catch(() => {
        throw new Error("Package `@llm-tools/embedjs-loader-sitemap` needs to be installed to load sitemaps");
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported SitemapLoader");
      if (await SitemapLoader2.test(loaderData)) {
        return new SitemapLoader2({ url: loaderData });
      }
      const { XmlLoader: XmlLoader2 } = await Promise.resolve().then(() => (init_src9(), src_exports7)).catch(() => {
        throw new Error("Package `@llm-tools/embedjs-loader-xml` needs to be installed to load XML documents");
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported XmlLoader");
      return new XmlLoader2({ filePathOrUrl: loaderData });
    }
    case "text/x-markdown":
    case "text/markdown": {
      const { MarkdownLoader: MarkdownLoader2 } = await Promise.resolve().then(() => (init_src10(), src_exports8)).catch(() => {
        throw new Error(
          "Package `@llm-tools/embedjs-loader-markdown` needs to be installed to load markdown files"
        );
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported MarkdownLoader");
      return new MarkdownLoader2({ filePathOrUrl: loaderData });
    }
    case "image/png":
    case "image/jpeg": {
      const { ImageLoader: ImageLoader2 } = await Promise.resolve().then(() => (init_src11(), src_exports9)).catch(() => {
        throw new Error("Package `@llm-tools/embedjs-loader-image` needs to be installed to load images");
      });
      createDebugMessages13("embedjs:util:createLoaderFromMimeType")("Dynamically imported ImageLoader");
      return new ImageLoader2({ filePathOrUrl: loaderData, mime: mimeType });
    }
    case void 0:
      throw new Error(`MIME type could not be detected. Please file an issue if you think this is a bug.`);
    default:
      throw new Error(`Unknown mime type '${mimeType}'`);
  }
}

// core/embedjs/src/loaders/local-path-loader.ts
init_src();

// core/embedjs/src/loaders/json-loader.ts
init_src();
init_src2();
import md514 from "md5";

// core/embedjs/src/loaders/url-loader.ts
init_src2();
init_src();
import { getMimeType as getMimeType3 } from "stream-mime-type";
import createDebugMessages15 from "debug";
import md515 from "md5";
var UrlLoader = class extends BaseLoader {
  debug = createDebugMessages15("embedjs:loader:UrlLoader");
  url;
  constructor({ url }) {
    super(`UrlLoader_${md515(url)}`, { url: truncateCenterString(url, 50) });
    this.url = new URL(url);
    this.debug(`UrlLoader verified '${url}' is a valid URL!`);
  }
  async *getUnfilteredChunks() {
    const response = await getSafe(this.url.href, { headers: { "Accept-Encoding": "" } });
    const stream = response.body;
    let { mime: mime2 } = await getMimeType3(stream, { strict: true });
    this.debug(`Loader stream detected type '${mime2}'`);
    if (!mime2) {
      mime2 = contentTypeToMimeType(response.headers.get("content-type"));
      this.debug(`Using type '${mime2}' from content-type header`);
    }
    try {
      const loader = await createLoaderFromMimeType(this.url.href, mime2);
      for await (const result of await loader.getUnfilteredChunks()) {
        yield {
          pageContent: result.pageContent,
          metadata: {
            type: "UrlLoader",
            source: this.url.href
          }
        };
      }
    } catch (err) {
      this.debug(`Error creating loader for mime type '${mime2}'`, err);
    }
  }
};

// core/embedjs/src/index.ts
init_src();

// examples/dynamic/src/main.ts
init_src3();

// databases/embedjs-hnswlib/src/hnswlib-db.ts
import HNSWLib from "hnswlib-node";
import createDebugMessages16 from "debug";
var HNSWDb = class {
  debug = createDebugMessages16("embedjs:vector:HNSWDb");
  index;
  docCount;
  docMap;
  async init({ dimensions }) {
    this.index = await new HNSWLib.HierarchicalNSW("cosine", dimensions);
    this.index.initIndex(0);
    this.docMap = /* @__PURE__ */ new Map();
    this.docCount = 0;
  }
  async insertChunks(chunks) {
    const needed = this.index.getCurrentCount() + chunks.length;
    this.index.resizeIndex(needed);
    for (const chunk of chunks) {
      this.docCount++;
      this.index.addPoint(chunk.vector, this.docCount);
      this.docMap.set(this.docCount, { pageContent: chunk.pageContent, metadata: chunk.metadata });
    }
    return chunks.length;
  }
  async similaritySearch(query, k) {
    k = Math.min(k, this.index.getCurrentCount());
    const result = this.index.searchKnn(query, k, (label) => this.docMap.has(label));
    return result.neighbors.map((label, index) => {
      return {
        ...this.docMap.get(label),
        score: result.distances[index]
      };
    });
  }
  async getVectorCount() {
    return this.index.getCurrentCount();
  }
  async deleteKeys() {
    this.debug("deleteKeys is not supported by HNSWDb");
    return false;
  }
  async reset() {
    await this.init({ dimensions: this.index.getNumDimensions() });
  }
};

// examples/dynamic/src/main.ts
var llmApplication = await new RAGApplicationBuilder().setModel(new OpenAi({ modelName: "gpt-4o" })).setEmbeddingModel(new OpenAiEmbeddings()).setVectorDatabase(new HNSWDb()).build();
await llmApplication.addLoader(new UrlLoader({ url: "https://en.wikipedia.org/wiki/Tesla,_Inc." }));
console.log(await llmApplication.query("Who founded Tesla?"));
//# sourceMappingURL=main.js.map
