"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoaderFromMimeType = createLoaderFromMimeType;
const tslib_1 = require("tslib");
const mime_1 = tslib_1.__importDefault(require("mime"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const text_loader_js_1 = require("../loaders/text-loader.cjs");
async function createLoaderFromMimeType(loaderData, mimeType) {
    (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')(`Incoming mime type '${mimeType}'`);
    switch (mimeType) {
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
            const { DocxLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-msoffice'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-msoffice` needs to be installed to load docx files');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported DocxLoader');
            return new DocxLoader({ filePathOrUrl: loaderData });
        }
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
            const { ExcelLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-msoffice'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-msoffice` needs to be installed to load excel files');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported ExcelLoader');
            return new ExcelLoader({ filePathOrUrl: loaderData });
        }
        case 'application/pdf': {
            const { PdfLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-pdf'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-pdf` needs to be installed to load PDF files');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported PdfLoader');
            return new PdfLoader({ filePathOrUrl: loaderData });
        }
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
            const { PptLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-msoffice'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-msoffice` needs to be installed to load pptx files');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported PptLoader');
            return new PptLoader({ filePathOrUrl: loaderData });
        }
        case 'text/plain': {
            const fineType = mime_1.default.getType(loaderData);
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')(`Fine type for '${loaderData}' is '${fineType}'`);
            if (fineType === 'text/csv') {
                const { CsvLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-csv'))).catch(() => {
                    throw new Error('Package `@llm-tools/embedjs-loader-csv` needs to be installed to load CSV files');
                });
                (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported CsvLoader');
                return new CsvLoader({ filePathOrUrl: loaderData });
            }
            else
                return new text_loader_js_1.TextLoader({ text: loaderData });
        }
        case 'application/csv': {
            const { CsvLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-csv'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-csv` needs to be installed to load CSV files');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported CsvLoader');
            return new CsvLoader({ filePathOrUrl: loaderData });
        }
        case 'text/html': {
            const { WebLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-web'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-web` needs to be installed to load web documents');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported WebLoader');
            return new WebLoader({ urlOrContent: loaderData });
        }
        case 'text/xml': {
            const { SitemapLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-sitemap'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-sitemap` needs to be installed to load sitemaps');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported SitemapLoader');
            if (await SitemapLoader.test(loaderData)) {
                return new SitemapLoader({ url: loaderData });
            }
            //This is not a Sitemap but is still XML
            const { XmlLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-xml'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-xml` needs to be installed to load XML documents');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported XmlLoader');
            return new XmlLoader({ filePathOrUrl: loaderData });
        }
        case 'text/x-markdown':
        case 'text/markdown': {
            const { MarkdownLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-markdown'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-markdown` needs to be installed to load markdown files');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported MarkdownLoader');
            return new MarkdownLoader({ filePathOrUrl: loaderData });
        }
        case 'image/png':
        case 'image/jpeg': {
            const { ImageLoader } = await Promise.resolve().then(() => tslib_1.__importStar(require('@llm-tools/embedjs-loader-image'))).catch(() => {
                throw new Error('Package `@llm-tools/embedjs-loader-image` needs to be installed to load images');
            });
            (0, debug_1.default)('embedjs:util:createLoaderFromMimeType')('Dynamically imported ImageLoader');
            return new ImageLoader({ filePathOrUrl: loaderData, mime: mimeType });
        }
        case undefined:
            throw new Error(`MIME type could not be detected. Please file an issue if you think this is a bug.`);
        default:
            throw new Error(`Unknown mime type '${mimeType}'`);
    }
}
//# sourceMappingURL=mime.js.map