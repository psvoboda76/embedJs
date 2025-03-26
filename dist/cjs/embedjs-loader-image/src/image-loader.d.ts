import { BaseLoader, BaseModel } from '@llm-tools/embedjs-interfaces';
export declare class ImageLoader extends BaseLoader<{
    type: 'ImageLoader';
}> {
    private readonly debug;
    private readonly filePathOrUrl;
    private readonly isUrl;
    private captionModel;
    private mime?;
    constructor({ filePathOrUrl, captionModel, mime, }: {
        filePathOrUrl: string;
        captionModel?: BaseModel;
        mime?: string;
    });
    injectModel(model: BaseModel): void;
    getUnfilteredChunks(): AsyncGenerator<{
        pageContent: string;
        metadata: {
            type: "ImageLoader";
            source: string;
        };
    }, void, unknown>;
}
