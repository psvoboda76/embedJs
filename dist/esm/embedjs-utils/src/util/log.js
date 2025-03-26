import util from 'util';
export function deepLog(obj) {
    console.log(util.inspect(obj, { depth: null, colors: true, sorted: true, compact: false }));
}
//# sourceMappingURL=log.js.map