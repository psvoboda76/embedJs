import md5 from 'md5';
import usetube from 'usetube';
import createDebugMessages from 'debug';
import { BaseLoader } from '@llm-tools/embedjs-interfaces';
import { YoutubeLoader } from './youtube-loader.js';
export class YoutubeChannelLoader extends BaseLoader {
    debug = createDebugMessages('embedjs:loader:YoutubeChannelLoader');
    channelId;
    constructor({ youtubeChannelId, chunkSize, chunkOverlap, }) {
        super(`YoutubeChannelLoader_${md5(youtubeChannelId)}`, { youtubeChannelId }, chunkSize ?? 2000, chunkOverlap);
        this.channelId = youtubeChannelId;
    }
    async *getUnfilteredChunks() {
        try {
            const videos = await usetube.getChannelVideos(this.channelId);
            this.debug(`Channel '${this.channelId}' returned ${videos.length} videos`);
            const videoIds = videos.map((v) => v.id);
            for (const videoId of videoIds) {
                const youtubeLoader = new YoutubeLoader({
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
//# sourceMappingURL=youtube-channel-loader.js.map