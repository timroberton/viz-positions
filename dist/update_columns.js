"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.updateColumnsWithBreakInfo = exports.sortAndCollapseSegmentTracks = exports.updateColumnsWithSegmentsNormalAndAround = exports.updateColumnsWithYOffsets = exports.updateColumnsWithEdgeConnections = void 0;
var types_1 = require("./types");
var get_keys_1 = require("./get_keys");
var utils_1 = require("./utils");
var get_segment_direction_1 = require("./get_segment_direction");
function updateColumnsWithEdgeConnections(columns, edges, nodeCoordMap, edgeCoordMap) {
    columns.forEach(function (colInfo) {
        colInfo.numberOfNonConnectingNodes = colInfo.nodeIds.filter(function (a) { return !nodeCoordMap[a].isConnecting; }).length;
        colInfo.keyIsLeftOtherIsRight = colInfo.nodeIds.reduce(function (map, nodeId) {
            map[nodeId] = [];
            return map;
        }, {});
        colInfo.keyIsRightOtherIsLeft = colInfo.nodeIds.reduce(function (map, nodeId) {
            map[nodeId] = [];
            return map;
        }, {});
        colInfo.keyIsSameFromOtherIsSameTo = colInfo.nodeIds.reduce(function (map, nodeId) {
            map[nodeId] = [];
            return map;
        }, {});
    });
    edges.forEach(function (edge) {
        var nodeChain = edgeCoordMap[edge.id].nodeChain;
        var frEnd = edge.fr;
        var toEnd = edge.to;
        for (var i = 0; i < nodeChain.length - 1; i++) { // Note: Only go to -1 of length
            var from = nodeChain[i];
            var to = nodeChain[i + 1];
            var fromLayer = nodeCoordMap[from].layer;
            var toLayer = nodeCoordMap[to].layer;
            if (toLayer > fromLayer) {
                columns[fromLayer].keyIsLeftOtherIsRight[from].push({
                    self: from,
                    other: to,
                    frEnd: frEnd,
                    toEnd: toEnd,
                    offsetSelf: 0,
                    offsetOther: 0,
                    horizontalDirection: types_1.HorizontalDirection.LeftToRight
                });
                columns[toLayer].keyIsRightOtherIsLeft[to].push({
                    self: to,
                    other: from,
                    frEnd: frEnd,
                    toEnd: toEnd,
                    offsetSelf: 0,
                    offsetOther: 0,
                    horizontalDirection: types_1.HorizontalDirection.LeftToRight
                });
            }
            if (fromLayer > toLayer) {
                columns[fromLayer].keyIsRightOtherIsLeft[from].push({
                    self: from,
                    other: to,
                    frEnd: frEnd,
                    toEnd: toEnd,
                    offsetSelf: 0,
                    offsetOther: 0,
                    horizontalDirection: types_1.HorizontalDirection.RightToLeft
                });
                columns[toLayer].keyIsLeftOtherIsRight[to].push({
                    self: to,
                    other: from,
                    frEnd: frEnd,
                    toEnd: toEnd,
                    offsetSelf: 0,
                    offsetOther: 0,
                    horizontalDirection: types_1.HorizontalDirection.RightToLeft
                });
            }
            if (fromLayer === toLayer) {
                columns[fromLayer].keyIsSameFromOtherIsSameTo[from].push({
                    self: from,
                    other: to,
                    frEnd: frEnd,
                    toEnd: toEnd,
                    offsetSelf: 0,
                    offsetOther: 0,
                    horizontalDirection: types_1.HorizontalDirection.Same
                });
            }
        }
    });
    return columns;
}
exports.updateColumnsWithEdgeConnections = updateColumnsWithEdgeConnections;
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
function updateColumnsWithYOffsets(columns, nodeCoordMap) {
    columns.forEach(function (colInfo) {
        colInfo.nodeIds.forEach(function (nodeId) {
            colInfo.keyIsLeftOtherIsRight[nodeId].forEach(function (c) {
                c.offsetSelf = getYOffset(c.self, c.horizontalDirection === types_1.HorizontalDirection.LeftToRight ? types_1.IncomingOutgoing.Outgoing : types_1.IncomingOutgoing.Incoming, c.other, nodeCoordMap);
                c.offsetOther = getYOffset(c.other, c.horizontalDirection === types_1.HorizontalDirection.LeftToRight ? types_1.IncomingOutgoing.Incoming : types_1.IncomingOutgoing.Outgoing, c.self, nodeCoordMap);
            });
            colInfo.keyIsRightOtherIsLeft[nodeId].forEach(function (c) {
                c.offsetSelf = getYOffset(c.self, c.horizontalDirection === types_1.HorizontalDirection.LeftToRight ? types_1.IncomingOutgoing.Incoming : types_1.IncomingOutgoing.Outgoing, c.other, nodeCoordMap);
                c.offsetOther = getYOffset(c.other, c.horizontalDirection === types_1.HorizontalDirection.LeftToRight ? types_1.IncomingOutgoing.Outgoing : types_1.IncomingOutgoing.Incoming, c.self, nodeCoordMap);
            });
            colInfo.keyIsSameFromOtherIsSameTo[nodeId].forEach(function (c) {
                c.offsetSelf = getYOffset(c.self, types_1.IncomingOutgoing.Outgoing, c.other, nodeCoordMap);
                c.offsetOther = getYOffset(c.other, types_1.IncomingOutgoing.Incoming, c.self, nodeCoordMap);
            });
        });
    });
}
exports.updateColumnsWithYOffsets = updateColumnsWithYOffsets;
function getYOffset(nodeForWhichTheOffsetIsNeeded, incomingOutgoing, otherNext, nodeCoordMap) {
    var nc = nodeCoordMap[nodeForWhichTheOffsetIsNeeded];
    if (nc.isConnecting) {
        return 0;
    }
    return nc.yOffsetsUsingInOutKey[get_keys_1.getKeyInOutNext(incomingOutgoing, otherNext)];
}
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
function updateColumnsWithSegmentsNormalAndAround(columns, nodeCoordMap) {
    columns.forEach(function (colInfo) {
        colInfo.nodeIds.forEach(function (nodeId) {
            // NORMAL
            colInfo.keyIsLeftOtherIsRight[nodeId].forEach(function (connection) {
                var yLeft = nodeCoordMap[connection.self].y + connection.offsetSelf;
                var yRight = nodeCoordMap[connection.other].y + connection.offsetOther;
                var leftToRightGoesUp = yRight < yLeft;
                var leftToRightGoesDown = !leftToRightGoesUp && (yLeft < yRight);
                var leftToRightGoesStraight = !leftToRightGoesUp && !leftToRightGoesDown;
                var yTop = leftToRightGoesDown ? yLeft : yRight;
                var yBottom = leftToRightGoesDown ? yRight : yLeft;
                colInfo.segmentsNormalToTheRight.push({
                    left: connection.self,
                    right: connection.other,
                    frEnd: connection.frEnd,
                    toEnd: connection.toEnd,
                    horizontalDirection: connection.horizontalDirection,
                    yLeft: yLeft,
                    yRight: yRight,
                    yTop: yTop,
                    yBottom: yBottom,
                    totalHeight: yBottom - yTop,
                    leftToRightGoesUp: leftToRightGoesUp,
                    leftToRightGoesDown: leftToRightGoesDown,
                    leftToRightGoesStraight: leftToRightGoesStraight,
                    track: -1
                });
            });
            // AROUND
            colInfo.keyIsSameFromOtherIsSameTo[nodeId].forEach(function (connection) {
                var segmentDirection = get_segment_direction_1.getSegmentDirection(connection.self, connection.other, nodeCoordMap);
                if (segmentDirection === types_1.SegmentDirection.ImmediateUp || segmentDirection === types_1.SegmentDirection.ImmediateDown) {
                    colInfo.segmentsImmediate.push({
                        fr: connection.self,
                        to: connection.other,
                        goesUp: nodeCoordMap[connection.self].sequence > nodeCoordMap[connection.other].sequence,
                        goesDown: nodeCoordMap[connection.self].sequence < nodeCoordMap[connection.other].sequence
                    });
                    return;
                }
                var yFrom = nodeCoordMap[connection.self].y + connection.offsetSelf;
                var yTo = nodeCoordMap[connection.other].y + connection.offsetOther;
                var fromToGoesUp = yTo < yFrom;
                var fromToGoesDown = yFrom < yTo;
                var yTop = fromToGoesDown ? yFrom : yTo;
                var yBottom = fromToGoesDown ? yTo : yFrom;
                utils_1.vizAssert(yTop <= yBottom);
                colInfo.segmentsAroundToTheLeft.push({
                    from: connection.self,
                    to: connection.other,
                    yFrom: yFrom,
                    yTo: yTo,
                    yTop: yTop,
                    yBottom: yBottom,
                    totalHeight: yBottom - yTop,
                    fromToGoesUp: fromToGoesUp,
                    fromToGoesDown: fromToGoesDown,
                    track: -1
                });
            });
        });
    });
}
exports.updateColumnsWithSegmentsNormalAndAround = updateColumnsWithSegmentsNormalAndAround;
function sortAndCollapseSegmentTracks(columns, s) {
    var bGetsTrackToTheLeft = -1;
    var cGetsTrackToTheLeft = 1;
    columns.forEach(function (colInfo) {
        // NORMAL
        // Sort so that tracks to the left come first
        colInfo.segmentsNormalToTheRight.sort(function (b, c) {
            // First address special case of same start and end node, i.e. parallel edges, one going each way
            if (b.left === c.left && b.right === c.right) {
                return b.horizontalDirection === types_1.HorizontalDirection.RightToLeft
                    ? (b.leftToRightGoesUp ? cGetsTrackToTheLeft : bGetsTrackToTheLeft)
                    : (b.leftToRightGoesUp ? bGetsTrackToTheLeft : cGetsTrackToTheLeft);
            }
            if (b.leftToRightGoesDown && c.leftToRightGoesDown) {
                // If both go down, lowest (bottomest) yLeft gets track to the left
                return c.yLeft - b.yLeft;
            }
            if (b.leftToRightGoesUp && c.leftToRightGoesUp) {
                // If both go up, highest (toppest) yLeft gets track to the left
                return b.yLeft - c.yLeft;
            }
            // The following is arbitrary, but we need some system so all pairwise tracks get sorted (i.e. if we just return 0 here, it doesn't work)
            if (b.leftToRightGoesDown) {
                return bGetsTrackToTheLeft;
            }
            return cGetsTrackToTheLeft;
        });
        // AROUND
        // Sort so that tracks to the left come first
        colInfo.segmentsAroundToTheLeft.sort(function (b, c) {
            // Longest height gets track to the left;
            return c.totalHeight - b.totalHeight;
        });
        // Collapse
        var _PREVENT_COLLAPSE = false; // <----------------------------------------------------------- Remove this after testing
        collapseNormal(colInfo.segmentsNormalToTheRight, s, _PREVENT_COLLAPSE);
        collapseAround(colInfo.segmentsAroundToTheLeft, s, _PREVENT_COLLAPSE);
    });
}
exports.sortAndCollapseSegmentTracks = sortAndCollapseSegmentTracks;
function collapseNormal(segs, s, _PREVENT_COLLAPSE) {
    var tracks = new Array(segs.length).fill(0).map(function () { return []; });
    segs.forEach(function (seg, segIndex) {
        if (seg.leftToRightGoesStraight) {
            seg.track = 0;
            return;
        }
        var firstTrackToTry = segIndex - 1;
        for (var i = firstTrackToTry; i >= 0; i--) { // Note: i is decremented, and will skip if i < 0 (i.e. will skip first seg)
            if (_PREVENT_COLLAPSE || cannotFitNormal(seg, tracks[i], s)) {
                seg.track = i + 1;
                tracks[i + 1].push(seg);
                return;
            }
        }
        seg.track = 0;
        tracks[0].push(seg);
    });
}
function cannotFitNormal(seg, segs, s) {
    if (seg.leftToRightGoesDown) {
        for (var i = 0; i < segs.length; i++) {
            var clearsAbove = (seg.yBottom < (segs[i].yTop - s.COLLAPSE_BUFFER));
            var clearsBelow = (seg.yTop > (segs[i].yBottom));
            if (!clearsAbove && !clearsBelow) {
                return true;
            }
        }
    }
    else {
        for (var i = 0; i < segs.length; i++) {
            var clearsAbove = (seg.yBottom < (segs[i].yTop));
            var clearsBelow = (seg.yTop > (segs[i].yBottom + s.COLLAPSE_BUFFER));
            if (!clearsAbove && !clearsBelow) {
                return true;
            }
        }
    }
    return false;
}
function collapseAround(segs, s, _PREVENT_COLLAPSE) {
    var tracks = new Array(segs.length).fill(0).map(function () { return []; });
    segs.forEach(function (seg, segIndex) {
        var firstTrackToTry = segIndex - 1;
        for (var i = firstTrackToTry; i >= 0; i--) { // Note: i is decremented, and will skip if i < 0 (i.e. will skip first seg)
            if (_PREVENT_COLLAPSE || cannotFitAround(seg, tracks[i], s)) {
                seg.track = i + 1;
                tracks[i + 1].push(seg);
                return;
            }
        }
        seg.track = 0;
        tracks[0].push(seg);
    });
}
function cannotFitAround(seg, segs, s) {
    if (seg.fromToGoesDown) {
        for (var i = 0; i < segs.length; i++) {
            var clearsAbove = (seg.yBottom < (segs[i].yTop - s.COLLAPSE_BUFFER));
            var clearsBelow = (seg.yTop > (segs[i].yBottom));
            if (!clearsAbove && !clearsBelow) {
                return true;
            }
        }
    }
    else {
        for (var i = 0; i < segs.length; i++) {
            var clearsAbove = (seg.yBottom < (segs[i].yTop));
            var clearsBelow = (seg.yTop > (segs[i].yBottom + s.COLLAPSE_BUFFER));
            if (!clearsAbove && !clearsBelow) {
                return true;
            }
        }
    }
    return false;
}
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
function updateColumnsWithBreakInfo(columns, tiles, tileCoordMap) {
    columns.forEach(function (colInfo, i) {
        colInfo.numberTracksNormalL = i === 0 ? 0 : numberOfTracksNormalToTheRight(columns, i - 1);
        colInfo.numberTracksNormalR = numberOfTracksNormalToTheRight(columns, i);
        colInfo.hasTracksNormalL = colInfo.numberTracksNormalL > 0;
        colInfo.hasTracksNormalR = colInfo.numberTracksNormalR > 0;
        //
        colInfo.numberTracksAroundL = numberOfTracksAroundToTheLeft(columns, i);
        colInfo.numberTracksAroundR = i >= (columns.length - 1) ? 0 : numberOfTracksAroundToTheLeft(columns, i + 1);
        colInfo.hasTracksAroundL = colInfo.numberTracksAroundL > 0;
        colInfo.hasTracksAroundR = colInfo.numberTracksAroundR > 0;
        //
        var _a = getTileBreaks(i, tiles, tileCoordMap), hasTileBreakL = _a.hasTileBreakL, hasTileBreakR = _a.hasTileBreakR;
        colInfo.tileBreakL = hasTileBreakL;
        colInfo.tileBreakR = hasTileBreakR;
    });
}
exports.updateColumnsWithBreakInfo = updateColumnsWithBreakInfo;
function numberOfTracksNormalToTheRight(columns, iLayer) {
    var trackNumbers = columns[iLayer].segmentsNormalToTheRight.filter(function (seg) { return seg.leftToRightGoesUp || seg.leftToRightGoesDown; }).map(function (seg) { return seg.track; });
    return Math.max.apply(Math, __spreadArray([-1], trackNumbers)) + 1;
}
function numberOfTracksAroundToTheLeft(columns, iLayer) {
    var trackNumbers = columns[iLayer].segmentsAroundToTheLeft.map(function (seg) { return seg.track; });
    return Math.max.apply(Math, __spreadArray([-1], trackNumbers)) + 1;
}
function getTileBreaks(layerIndex, tiles, tileCoordMap) {
    return {
        hasTileBreakL: layerIndex === 0 ? true : tiles.some(function (t) { return tileCoordMap[t.id].finalFromLayer === layerIndex; }),
        hasTileBreakR: tiles.some(function (t) { return tileCoordMap[t.id].finalToLayer === layerIndex; })
    };
}
