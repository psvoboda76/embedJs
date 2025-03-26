export function mapAsync(array, callbackfn) {
    return Promise.all(array.map(callbackfn));
}
export async function filterAsync(array, callbackfn) {
    const filterMap = await mapAsync(array, callbackfn);
    return array.filter((_value, index) => filterMap[index]);
}
export function createArrayChunks(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_v, i) => arr.slice(i * size, i * size + size));
}
export function getUnique(array, K) {
    const seen = {};
    return array.filter(function (item) {
        return Object.prototype.hasOwnProperty.call(seen, item[K]()) ? false : (seen[item[K]()] = true);
    });
}
//# sourceMappingURL=arrays.js.map