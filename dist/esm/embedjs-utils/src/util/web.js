import createDebugMessages from 'debug';
const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
export async function getSafe(url, options) {
    const headers = options?.headers ?? {};
    headers['User-Agent'] = headers['User-Agent'] ?? DEFAULT_USER_AGENT;
    const format = options?.format ?? 'stream';
    const response = await fetch(url, { headers });
    createDebugMessages('embedjs:util:getSafe')(`URL '${url}' returned status code ${response.status}`);
    if (response.status !== 200)
        throw new Error(`Failed to fetch URL '${url}'. Got status code ${response.status}.`);
    return {
        body: format === 'text'
            ? await response.text()
            : format === 'buffer'
                ? Buffer.from(await response.arrayBuffer())
                : response.body,
        statusCode: response.status,
        headers: response.headers,
    };
}
//# sourceMappingURL=web.js.map