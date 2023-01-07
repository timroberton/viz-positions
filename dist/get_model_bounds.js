"use strict";
exports.__esModule = true;
exports.getModelBounds = void 0;
function getModelBounds(columns) {
    var bounds = {
        xMin: Number.POSITIVE_INFINITY,
        xMax: Number.NEGATIVE_INFINITY,
        yMin: Number.POSITIVE_INFINITY,
        yMax: Number.NEGATIVE_INFINITY
    };
    columns.forEach(function (a) {
        bounds.xMin = Math.min(a.xl, bounds.xMin);
        bounds.xMax = Math.max(a.xr, bounds.xMax);
        bounds.yMin = Math.min(a.yt, bounds.yMin);
        bounds.yMax = Math.max(a.yb, bounds.yMax);
    });
    return bounds;
}
exports.getModelBounds = getModelBounds;
