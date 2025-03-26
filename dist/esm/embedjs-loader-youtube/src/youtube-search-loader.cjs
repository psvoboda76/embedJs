"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeSearchLoader = void 0;
const tslib_1 = require("tslib");
const md5_1 = tslib_1.__importDefault(require("md5"));
const usetube_1 = tslib_1.__importDefault(require("usetube"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const youtube_channel_loader_js_1 = require("./youtube-channel-loader.cjs");
class YoutubeSearchLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:YoutubeSearchLoader');
    searchString;
    constructor({ youtubeSearchString, chunkSize, chunkOverlap, }) {
        super(`YoutubeSearchLoader${(0, md5_1.default)(youtubeSearchString)}`, { youtubeSearchString }, chunkSize ?? 2000, chunkOverlap);
        this.searchString = youtubeSearchString;
    }
    async *getUnfilteredChunks() {
        try {
            const { channels } = await usetube_1.default.searchChannel(this.searchString);
            this.debug(`Search for channels with search string '${this.searchString}' found ${channels.length} entries`);
            const channelIds = channels.map((c) => c.channel_id);
            for (const youtubeChannelId of channelIds) {
                const youtubeLoader = new youtube_channel_loader_js_1.YoutubeChannelLoader({
                    youtubeChannelId,
                    chunkSize: this.chunkSize,
                    chunkOverlap: this.chunkOverlap,
                });
                for await (const chunk of youtubeLoader.getUnfilteredChunks()) {
                    yield {
                        ...chunk,
                        metadata: {
                            ...chunk.metadata,
                            type: 'YoutubeSearchLoader',
                            originalSource: this.searchString,
                        },
                    };
                }
            }
        }
        catch (e) {
            this.debug('Could not search for string', this.searchString, e);
        }
    }
}
exports.YoutubeSearchLoader = YoutubeSearchLoader;
//# sourceMappingURL=youtube-search-loader.js.map