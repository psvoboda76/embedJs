"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageLoader = void 0;
const tslib_1 = require("tslib");
const messages_1 = require("@langchain/core/messages");
const stream_mime_type_1 = require("stream-mime-type");
const debug_1 = tslib_1.__importDefault(require("debug"));
const exifremove_1 = tslib_1.__importDefault(require("exifremove"));
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const md5_1 = tslib_1.__importDefault(require("md5"));
const embedjs_interfaces_1 = require("@llm-tools/embedjs-interfaces");
const embedjs_utils_1 = require("@llm-tools/embedjs-utils");
class ImageLoader extends embedjs_interfaces_1.BaseLoader {
    debug = (0, debug_1.default)('embedjs:loader:ImageLoader');
    filePathOrUrl;
    isUrl;
    captionModel;
    mime;
    constructor({ filePathOrUrl, captionModel, mime, }) {
        super(`ImageLoader_${(0, md5_1.default)(filePathOrUrl)}`, { filePathOrUrl }, 100000, 300);
        this.mime = mime;
        this.captionModel = captionModel;
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = (0, embedjs_utils_1.isValidURL)(filePathOrUrl) ? true : false;
    }
    injectModel(model) {
        if (!this.captionModel) {
            this.captionModel = model;
        }
    }
    async *getUnfilteredChunks() {
        if (!this.captionModel)
            throw new Error('No model available to describe image');
        if (!this.mime) {
            this.debug('Mime type not provided; starting auto-detect');
            if (this.isUrl) {
                const response = await (0, embedjs_utils_1.getSafe)(this.filePathOrUrl, { headers: { 'Accept-Encoding': '' } });
                const stream = response.body;
                this.mime = (await (0, stream_mime_type_1.getMimeType)(stream, { strict: true })).mime;
                if (!this.mime) {
                    this.mime = (0, embedjs_utils_1.contentTypeToMimeType)(response.headers.get('content-type'));
                    this.debug(`Using type '${this.mime}' from content-type header`);
                }
            }
            else {
                const stream = node_fs_1.default.createReadStream(this.filePathOrUrl);
                this.mime = (await (0, stream_mime_type_1.getMimeType)(stream)).mime;
                stream.destroy();
            }
        }
        this.debug(`Image stream detected type '${this.mime}'`);
        const buffer = this.isUrl
            ? (await (0, embedjs_utils_1.getSafe)(this.filePathOrUrl, { format: 'buffer' })).body
            : await (0, embedjs_utils_1.streamToBuffer)(node_fs_1.default.createReadStream(this.filePathOrUrl));
        const plainImageBuffer = exifremove_1.default.remove(buffer);
        const message = new messages_1.HumanMessage({
            content: [
                {
                    type: 'text',
                    text: 'what does this image contain?',
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: `data:${this.mime};base64,${plainImageBuffer.toString('base64')}`,
                    },
                },
            ],
        });
        this.debug('Asking LLM to describe image');
        const response = await this.captionModel.simpleQuery([message]);
        this.debug('LLM describes image as: ', response.result);
        yield {
            pageContent: (0, embedjs_utils_1.cleanString)(response.result),
            metadata: {
                type: 'ImageLoader',
                source: this.filePathOrUrl,
            },
        };
        this.debug(`Loaded image details for filePathOrUrl '${this.filePathOrUrl}'`);
    }
}
exports.ImageLoader = ImageLoader;
//# sourceMappingURL=image-loader.js.map