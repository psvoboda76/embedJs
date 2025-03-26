import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { YoutubeTranscript } from 'youtube-transcript';
import createDebugMessages from 'debug';
import md5 from 'md5';
import { BaseLoader } from '@llm-tools/embedjs-interfaces';
import { cleanString } from '@llm-tools/embedjs-utils';
export class YoutubeLoader extends BaseLoader {
    debug = createDebugMessages('embedjs:loader:YoutubeLoader');
    videoIdOrUrl;
    constructor({ videoIdOrUrl, chunkSize, chunkOverlap, }) {
        super(`YoutubeLoader_${md5(videoIdOrUrl)}`, { videoIdOrUrl }, chunkSize ?? 2000, chunkOverlap ?? 0);
        this.videoIdOrUrl = videoIdOrUrl;
    }
    async *getUnfilteredChunks() {
        const chunker = new RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        try {
            const transcripts = await YoutubeTranscript.fetchTranscript(this.videoIdOrUrl, { lang: 'en' });
            this.debug(`Transcripts (length ${transcripts.length}) obtained for video`, this.videoIdOrUrl);
            for (const transcript of transcripts) {
                for (const chunk of await chunker.splitText(cleanString(transcript.text))) {
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
//# sourceMappingURL=youtube-loader.js.map