"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfluenceLoader = void 0;
const tslib_1 = require("tslib");
const confluence_js_1 = require("confluence.js");
const debug_1 = tslib_1.__importDefault(require("debug"));
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_loader_web_1 = require("@llm-tools/embedjs-loader-web");
class ConfluenceLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:ConfluenceLoader');
    confluence;
    confluenceBaseUrl;
    spaceName;
    lastUpdatedFilter;
    constructor({ spaceName, confluenceBaseUrl, confluenceUsername, confluenceToken, chunkSize, chunkOverlap, filterOptions, }) {
        super(`ConfluenceLoader_${(0, md5_1.default)(spaceName)}`, { spaceName }, chunkSize ?? 2000, chunkOverlap ?? 200);
        this.spaceName = spaceName;
        this.confluenceBaseUrl = confluenceBaseUrl ?? process.env.CONFLUENCE_BASE_URL;
        this.lastUpdatedFilter = filterOptions?.lastUpdatedFilter ?? null;
        this.confluence = new confluence_js_1.ConfluenceClient({
            host: this.confluenceBaseUrl,
            authentication: {
                basic: {
                    username: confluenceUsername ?? process.env.CONFLUENCE_USER_NAME,
                    password: confluenceToken ?? process.env.CONFLUENCE_API_TOKEN,
                },
            },
        });
    }
    async *getUnfilteredChunks() {
        let count = 0;
        for await (const result of this.processSpace(this.spaceName)) {
            yield result;
            count++;
        }
        this.debug(`Space '${this.spaceName}' had ${count} new pages`);
    }
    async *processSpace(spaceKey) {
        this.debug('Processing space', spaceKey);
        try {
            const spaceContent = await this.confluence.space.getContentForSpace({ spaceKey });
            this.debug(`Confluence space '${spaceKey}' has '${spaceContent['page'].results.length}' root pages`);
            for (const { id, title } of spaceContent['page'].results) {
                for await (const result of this.processPage(id, title)) {
                    yield result;
                }
            }
        }
        catch (e) {
            this.debug('Could not get space details', spaceKey, e);
            return;
        }
    }
    async *processPage(pageId, title) {
        this.debug('Processing page', title);
        let confluenceVersion = 0;
        try {
            const pageProperties = await this.confluence.content.getContentById({
                id: pageId,
                expand: ['version', 'history'],
            });
            if (this.lastUpdatedFilter) {
                const pageLastEditDate = new Date(pageProperties.history.lastUpdated.when);
                if (pageLastEditDate > this.lastUpdatedFilter) {
                    this.debug(`Page '${title}' has last edit date ${pageLastEditDate}. Continuing...`);
                }
                else {
                    this.debug(`Page '${title}' has last edit date ${pageLastEditDate}, which is less than filter date. Skipping...`);
                    return;
                }
            }
            if (!pageProperties.version.number)
                throw new Error('Version number not found in page properties...');
            confluenceVersion = pageProperties.version.number;
        }
        catch (e) {
            this.debug('Could not get page properties. Page will be SKIPPED!', title, e.response);
            return;
        }
        let doProcess = false;
        if (!(await this.checkInCache(pageId))) {
            this.debug(`Processing '${title}' for the FIRST time...`);
            doProcess = true;
        }
        else {
            const cacheVersion = (await this.getFromCache(pageId)).version;
            if (cacheVersion !== confluenceVersion) {
                this.debug(`For page '${title}' - version in cache is ${cacheVersion} and confluence version is ${confluenceVersion}. This page will be PROCESSED.`);
                doProcess = true;
            }
            else
                this.debug(`For page '${title}' - version in cache and confluence are the same ${confluenceVersion}. This page will be SKIPPED.`);
        }
        if (!doProcess) {
            this.debug(`Skipping page '${title}'`);
            return;
        }
        try {
            const content = await this.confluence.content.getContentById({
                id: pageId,
                expand: ['body', 'children.page', 'body.view'],
            });
            if (!content.body.view.value) {
                this.debug(`Page '${pageId}' has empty content. Skipping...`);
                return;
            }
            this.debug(`Processing content for page '${title}'...`);
            for await (const result of this.getContentChunks(content.body.view.value, content._links.webui)) {
                yield result;
            }
            await this.saveToCache(pageId, { version: confluenceVersion });
            if (content.children) {
                for (const { id, title } of content.children.page.results) {
                    try {
                        for await (const result of this.processPage(id, title)) {
                            yield result;
                        }
                    }
                    catch (e) {
                        this.debug(`Error! Could not process page child '${title}'`, pageId, e);
                        return;
                    }
                }
            }
        }
        catch (e) {
            this.debug('Error! Could not process page content', pageId, e);
            return;
        }
    }
    async *getContentChunks(pageBody, pageUrl) {
        const webLoader = new embedjs_loader_web_1.WebLoader({
            urlOrContent: pageBody,
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        for await (const result of await webLoader.getUnfilteredChunks()) {
            //remove all types of empty brackets from string
            // eslint-disable-next-line no-useless-escape
            result.pageContent = result.pageContent.replace(/[\[\]\(\)\{\}]/g, '');
            yield {
                pageContent: result.pageContent,
                metadata: {
                    type: 'ConfluenceLoader',
                    source: `${this.confluenceBaseUrl}/wiki${pageUrl}`,
                },
            };
        }
    }
}
exports.ConfluenceLoader = ConfluenceLoader;
//# sourceMappingURL=confluence-loader.js.map