"use strict";
exports.__esModule = true;
exports.updateHorizontalPositions = void 0;
function updateHorizontalPositions(columns, nodes, nodeCoordMap, s) {
    nodes.forEach(function (node) {
        var nodeLayer = nodeCoordMap[node.id].layer;
        columns[nodeLayer].maxNodeWidth = Math.max(columns[nodeLayer].maxNodeWidth, node.w);
    });
    var current = 0;
    var maxIndex = columns.length - 1;
    columns.forEach(function (c, i) {
        var horizontalTileGapR = (s.SHOW_TILES && c.tileBreakR) ? s.TILE_HORIZONTAL_GAP : 0;
        //
        var extraPaddingForTracksNormalR = (s.SHOW_TILES && c.hasTracksNormalR && c.tileBreakR) ? s.TILE_HORIZONTAL_PADDING : 0;
        var widthTracksNormalR = c.hasTracksNormalR ? ((c.numberTracksNormalR - 1) * s.EDGE_TO_EDGE_HORIZONTAL_GAP) : 0;
        //
        var extraPaddingForTracksAroundL = (s.SHOW_TILES && c.tileBreakL)
            ? (c.hasTracksAroundL ? s.TILE_HORIZONTAL_PADDING : 0)
            : ((c.hasTracksAroundL && c.hasTracksNormalL) ? s.EDGE_TO_EDGE_HORIZONTAL_GAP : 0);
        var widthTracksAroundL = c.hasTracksAroundL ? ((c.numberTracksAroundL - 1) * s.EDGE_TO_EDGE_HORIZONTAL_GAP) : 0;
        //
        var onlyHalfSpaceL = i > 0 && !c.hasTracksNormalL && !c.tileBreakL && !c.hasTracksAroundL;
        var onlyHalfSpaceR = i < maxIndex && !c.hasTracksNormalR && !c.tileBreakR && !c.hasTracksAroundR;
        var paddingL = onlyHalfSpaceL ? s.TILE_HORIZONTAL_PADDING / 2 : s.TILE_HORIZONTAL_PADDING;
        var paddingR = onlyHalfSpaceR ? s.TILE_HORIZONTAL_PADDING / 2 : s.TILE_HORIZONTAL_PADDING;
        //
        c.xl = current;
        c.edgeVL = current + extraPaddingForTracksAroundL;
        c.nodeL = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL;
        c.xc = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + (c.maxNodeWidth / 2);
        c.nodeR = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + c.maxNodeWidth;
        c.edgeVR = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + c.maxNodeWidth + paddingR;
        c.xr = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + c.maxNodeWidth + paddingR + widthTracksNormalR + extraPaddingForTracksNormalR;
        current += extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + c.maxNodeWidth + paddingR + (widthTracksNormalR + extraPaddingForTracksNormalR + horizontalTileGapR);
    });
    var colsYT = Number.POSITIVE_INFINITY;
    var colsYB = Number.NEGATIVE_INFINITY;
    var noNodes = true;
    columns.forEach(function (colInfo, i) {
        colInfo.nodeIds.forEach(function (nodeId) {
            noNodes = false;
            var nodeLayer = nodeCoordMap[nodeId].layer;
            nodeCoordMap[nodeId].x = columns[nodeLayer].xc - (nodeCoordMap[nodeId].w / 2);
            nodeCoordMap[nodeId].colVL = columns[nodeLayer].edgeVL;
            nodeCoordMap[nodeId].colXR = columns[nodeLayer].edgeVR;
            colsYT = Math.min(colsYT, nodeCoordMap[nodeId].y);
            colsYB = Math.max(colsYB, nodeCoordMap[nodeId].y + nodeCoordMap[nodeId].h);
        });
    });
    if (noNodes) {
        colsYT = 0;
        colsYB = 100;
    }
    columns.forEach(function (c) {
        c.yt = colsYT - (s.SHOW_TILES ? s.TILE_VERTICAL_PADDING : 0);
        c.yb = colsYB + (s.SHOW_TILES ? s.TILE_VERTICAL_PADDING : 0);
    });
    return columns;
}
exports.updateHorizontalPositions = updateHorizontalPositions;
