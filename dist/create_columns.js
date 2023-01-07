"use strict";
exports.__esModule = true;
exports.createColumnsAndUpdateTileCoordMap = void 0;
var _MIN_WIDTH_FOR_TILES = 70;
function createColumnsAndUpdateTileCoordMap(tiles, nodes, tileCoordMap, s) {
    // Sort tiles into ascending layers
    tiles.sort(function (a, b) { return a.initialFromLayer - b.initialFromLayer; });
    var nTiles = tiles.length;
    var maxLayerTiles = nTiles === 0 ? 0 : tiles[nTiles - 1].initialFromLayer;
    var maxLayerNodes = Math.max.apply(Math, nodes.map(function (a) { return a.layer; }));
    var maxLayer = Math.max(maxLayerNodes, maxLayerTiles);
    var columns = new Array(maxLayer + 1).fill(0).map(function () {
        return {
            nodeIds: [],
            numberOfNonConnectingNodes: 0,
            keyIsLeftOtherIsRight: {},
            keyIsRightOtherIsLeft: {},
            keyIsSameFromOtherIsSameTo: {},
            //
            segmentsNormalToTheRight: [],
            segmentsAroundToTheLeft: [],
            segmentsImmediate: [],
            //
            numberTracksNormalL: 0,
            numberTracksNormalR: 0,
            hasTracksNormalL: false,
            hasTracksNormalR: false,
            //
            numberTracksAroundL: 0,
            numberTracksAroundR: 0,
            hasTracksAroundL: false,
            hasTracksAroundR: false,
            //
            tileBreakL: false,
            tileBreakR: false,
            //
            maxNodeWidth: _MIN_WIDTH_FOR_TILES,
            //
            xl: 0,
            xc: 0,
            xr: 0,
            yt: 0,
            yb: 0,
            //
            nodeL: 0,
            nodeR: 0,
            //
            edgeVL: 0,
            edgeVR: 0
        };
    });
    nodes.forEach(function (node) {
        columns[node.layer].nodeIds.push(node.id);
    });
    if (nTiles === 0) {
        return columns;
    }
    // Add final layerings
    // We assume that tile layers are unique
    // We DON'T assume they start at zero
    for (var i = 0; i < tiles.length; i++) {
        var tc = tileCoordMap[tiles[i].id];
        tc.finalFromLayer = i === 0 ? 0 : tiles[i].initialFromLayer;
        tc.finalToLayer = tiles[i + 1] ? tiles[i + 1].initialFromLayer - 1 : maxLayer;
    }
    // Add joins
    tiles.forEach(function (tile, i) {
        var tc = tileCoordMap[tile.id];
        if (s.TILE_HORIZONTAL_GAP > 0) {
            tc.joinL = false;
            tc.joinR = false;
            return;
        }
        if (i === 0 && nTiles === 1) {
            tc.joinL = false;
            tc.joinR = false;
            return;
        }
        if (i === 0) {
            tc.joinL = false;
            tc.joinR = true;
            return;
        }
        if (i === nTiles - 1) {
            tc.joinL = true;
            tc.joinR = false;
            return;
        }
        tc.joinL = true;
        tc.joinR = true;
    });
    return columns;
}
exports.createColumnsAndUpdateTileCoordMap = createColumnsAndUpdateTileCoordMap;
