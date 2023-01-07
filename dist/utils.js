"use strict";
exports.__esModule = true;
exports.sumWith = exports.sum = exports.vizAssert = void 0;
function vizAssert(condition, errMessage) {
    if (!condition) {
        throw new Error(errMessage || "Should not be possible");
    }
}
exports.vizAssert = vizAssert;
function sum(arr) {
    return arr.reduce(function (prev, v) { return prev + v; }, 0);
}
exports.sum = sum;
function sumWith(arr, func) {
    return arr.reduce(function (prev, v) { return prev + func(v); }, 0);
}
exports.sumWith = sumWith;
