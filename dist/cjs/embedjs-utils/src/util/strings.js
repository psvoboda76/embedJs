"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateCenterString = truncateCenterString;
exports.cleanString = cleanString;
exports.stringFormat = stringFormat;
exports.historyToString = historyToString;
exports.toTitleCase = toTitleCase;
exports.isValidURL = isValidURL;
exports.isValidJson = isValidJson;
function truncateCenterString(fullStr, strLen, separator) {
    if (fullStr.length <= strLen)
        return fullStr;
    separator = separator || '...';
    const sepLen = separator.length, charsToShow = strLen - sepLen, frontChars = Math.ceil(charsToShow / 2), backChars = Math.floor(charsToShow / 2);
    return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
}
function cleanString(text) {
    text = text.replace(/\\/g, '');
    text = text.replace(/#/g, ' ');
    text = text.replace(/\. \./g, '.');
    text = text.replace(/\s\s+/g, ' ');
    text = text.replace(/(\r\n|\n|\r)/gm, ' ');
    return text.trim();
}
function stringFormat(template, ...args) {
    return template.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}
function historyToString(history) {
    return history.reduce((p, c) => {
        return p.concat(`${c.actor}: ${c.content}`);
    }, '');
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
function isValidURL(candidateUrl) {
    try {
        const url = new URL(candidateUrl);
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    catch {
        return false;
    }
}
function isValidJson(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=strings.js.map