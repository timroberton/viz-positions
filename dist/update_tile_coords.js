"use strict";
exports.__esModule = true;
exports.updateTileCoords = void 0;
function updateTileCoords(tiles, tileCoordMap, columns) {
    tiles.forEach(function (tile) {
        var tc = tileCoordMap[tile.id];
        tc.xl = columns[tc.finalFromLayer].xl;
        tc.xr = columns[tc.finalToLayer].xr;
        tc.yt = columns[tc.finalFromLayer].yt;
        tc.yb = columns[tc.finalFromLayer].yb;
    });
}
exports.updateTileCoords = updateTileCoords;
