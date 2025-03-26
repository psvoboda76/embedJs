"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamToBuffer = streamToBuffer;
exports.streamToString = streamToString;
exports.contentTypeToMimeType = contentTypeToMimeType;
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const _buf = Array();
        stream.on('data', (chunk) => _buf.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(_buf)));
        stream.on('error', (err) => reject(`error converting stream - ${err}`));
    });
}
async function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        stream.on('error', (err) => reject(`error converting stream - ${err}`));
    });
}
function contentTypeToMimeType(contentType) {
    if (!contentType)
        return contentType;
    if (contentType.includes(';'))
        return contentType.split(';')[0];
    else
        return contentType;
}
//# sourceMappingURL=stream.js.map