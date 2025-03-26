"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeChannelLoader = void 0;
const tslib_1 = require("tslib");
const md5_1 = tslib_1.__importDefault(require("md5"));
const usetube_1 = tslib_1.__importDefault(require("usetube"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const youtube_loader_js_1 = require("./youtube-loader.cjs");
class YoutubeChannelLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:YoutubeChannelLoader');
    channelId;
    constructor({ youtubeChannelId, chunkSize, chunkOverlap, }) {
        super(`YoutubeChannelLoader_${(0, md5_1.default)(youtubeChannelId)}`, { youtubeChannelId }, chunkSize ?? 2000, chunkOverlap);
        this.channelId = youtubeChannelId;
    }
    async *getUnfilteredChunks() {
        try {
            const videos = await usetube_1.default.getChannelVideos(this.channelId);
            this.debug(`Channel '${this.channelId}' returned ${videos.length} videos`);
            const videoIds = videos.map((v) => v.id);
            for (const videoId of videoIds) {
                const youtubeLoader = new youtube_loader_js_1.YoutubeLoader({
                    videoIdOrUrl: videoId,
                    chunkSize: this.chunkSize,
                    chunkOverlap: this.chunkOverlap,
                });
                for await (const chunk of youtubeLoader.getUnfilteredChunks()) {
                    yield {
                        ...chunk,
                        metadata: {
                            ...chunk.metadata,
                            type: 'YoutubeChannelLoader',
                            originalSource: this.channelId,
                        },
                    };
                }
            }
        }
        catch (e) {
            this.debug('Could not get videos for channel', this.channelId, e);
        }
    }
}
exports.YoutubeChannelLoader = YoutubeChannelLoader;
//# sourceMappingURL=youtube-channel-loader.js.map