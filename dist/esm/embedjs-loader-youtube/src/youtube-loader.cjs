"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeLoader = void 0;
const tslib_1 = require("tslib");
const textsplitters_1 = require("@langchain/textsplitters");
const youtube_transcript_1 = require("youtube-transcript");
const debug_1 = tslib_1.__importDefault(require("debug"));
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
class YoutubeLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:YoutubeLoader');
    videoIdOrUrl;
    constructor({ videoIdOrUrl, chunkSize, chunkOverlap, }) {
        super(`YoutubeLoader_${(0, md5_1.default)(videoIdOrUrl)}`, { videoIdOrUrl }, chunkSize ?? 2000, chunkOverlap ?? 0);
        this.videoIdOrUrl = videoIdOrUrl;
    }
    async *getUnfilteredChunks() {
        const chunker = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        try {
            const transcripts = await youtube_transcript_1.YoutubeTranscript.fetchTranscript(this.videoIdOrUrl, { lang: 'en' });
            this.debug(`Transcripts (length ${transcripts.length}) obtained for video`, this.videoIdOrUrl);
            for (const transcript of transcripts) {
                for (const chunk of await chunker.splitText((0, embedjs_utils_1.cleanString)(transcript.text))) {
                    yield {
                        pageContent: chunk,
                        metadata: {
                            type: 'YoutubeLoader',
                            source: this.videoIdOrUrl,
                        },
                    };
                }
            }
        }
        catch (e) {
            this.debug('Could not get transcripts for video', this.videoIdOrUrl, e);
        }
    }
}
exports.YoutubeLoader = YoutubeLoader;
//# sourceMappingURL=youtube-loader.js.map