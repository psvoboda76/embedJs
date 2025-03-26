import { parse } from 'csv-parse';
import createDebugMessages from 'debug';
import fs from 'node:fs';
import md5 from 'md5';
import { BaseLoader } from '@llm-tools/embedjs-interfaces';
import { cleanString, getSafe, isValidURL, streamToBuffer } from '@llm-tools/embedjs-utils';
export class CsvLoader extends BaseLoader {
    debug = createDebugMessages('embedjs:loader:CsvLoader');
    csvParseOptions;
    filePathOrUrl;
    isUrl;
    constructor({ filePathOrUrl, csvParseOptions, chunkOverlap, chunkSize, }) {
        super(`CsvLoader_${md5(filePathOrUrl)}`, { filePathOrUrl }, chunkSize ?? 1000, chunkOverlap ?? 0);
        this.filePathOrUrl = filePathOrUrl;
        this.isUrl = isValidURL(filePathOrUrl) ? true : false;
        this.csvParseOptions = csvParseOptions ?? { autoParse: true };
    }
    async *getUnfilteredChunks() {
        const buffer = this.isUrl
            ? (await getSafe(this.filePathOrUrl, { format: 'buffer' })).body
            : await streamToBuffer(fs.createReadStream(this.filePathOrUrl));
        this.debug('CsvParser stream created');
        const parser = parse(buffer, this.csvParseOptions);
        this.debug('CSV parsing started...');
        for await (const record of parser) {
            yield {
                pageContent: cleanString(record.join(',')),
                metadata: {
                    type: 'CsvLoader',
                    source: this.filePathOrUrl,
                },
            };
        }
        this.debug(`CsvParser for filePathOrUrl '${this.filePathOrUrl}' finished`);
    }
}
//# sourceMappingURL=csv-loader.js.map