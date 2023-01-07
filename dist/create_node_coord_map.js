"use strict";
exports.__esModule = true;
exports.updateNodeCoordMapWithTrackMaps = exports.updateNodeCoordMapWithYOffsets = exports.addAndSortNodeJoins = exports.createTileCoordMap = exports.createEdgeCoordMap = exports.newNodeCoords = exports.createNodeCoordMap = void 0;
var types_1 = require("./types");
var utils_1 = require("./utils");
var get_segment_direction_1 = require("./get_segment_direction");
var get_keys_1 = require("./get_keys");
function createNodeCoordMap(nodes) {
    return nodes.reduce(function (map, node) {
        map[node.id] = newNodeCoords(node.w, node.h, false, node.layer, "", "");
        return map;
    }, {});
}
exports.createNodeCoordMap = createNodeCoordMap;
function newNodeCoords(w, h, isConnecting, layer, endFrIfConnecting, endToIfConnecting) {
    return {
        w: w,
        h: h,
        isConnecting: isConnecting,
        endFrIfConnecting: endFrIfConnecting,
        endToIfConnecting: endToIfConnecting,
        //
        layer: layer,
        sequence: -1,
        sequenceIgnoringConnectingNodes: -1,
        //
        x: -1,
        y: -1,
        //
        colXL: -1,
        colXR: -1,
        colVL: -1,
        trackMapXR_forLeftNodes: {},
        trackMapVL_forFromNodes: {},
        immediateOffsetMapIncoming: {},
        immediateOffsetMapOutgoing: {},
        //
        joinsL: [],
        joinsR: [],
        joinsT: [],
        joinsB: [],
        yOffsetsUsingInOutKey: {}
    };
}
exports.newNodeCoords = newNodeCoords;
function createEdgeCoordMap(edges) {
    return edges.reduce(function (map, edge) {
        map[edge.id] = {
            id: edge.id,
            fr: edge.fr,
            to: edge.to,
            nodeChain: [],
            edgeSegments: [],
            pathData: ""
        };
        return map;
    }, {});
}
exports.createEdgeCoordMap = createEdgeCoordMap;
function createTileCoordMap(tiles) {
    return tiles.reduce(function (map, edge) {
        map[edge.id] = {
            finalFromLayer: -1,
            finalToLayer: -1,
            joinL: false,
            joinR: false,
            //
            xl: -1,
            xr: -1,
            yt: -1,
            yb: -1
        };
        return map;
    }, {});
}
exports.createTileCoordMap = createTileCoordMap;
function addAndSortNodeJoins(nodes, edges, nodeCoordMap, edgeCoordMap) {
    edges.forEach(function (a) {
        var nodeChain = edgeCoordMap[a.id].nodeChain;
        utils_1.vizAssert(nodeChain.length >= 2);
        var nextFr = nodeChain[1];
        var nextTo = nodeChain[nodeChain.length - 2];
        var segmentDirection = get_segment_direction_1.getSegmentDirection(a.fr, a.to, nodeCoordMap); // Note: Ok to use originalFr/originalTo for this particular function call, since only need crude direction
        if (segmentDirection === types_1.SegmentDirection.LeftToRight) {
            nodeCoordMap[a.fr].joinsR.push({ incomingOutgoing: types_1.IncomingOutgoing.Outgoing, nextNodeChainIdForSorting: nextFr, finalOrder: -1 });
            nodeCoordMap[a.to].joinsL.push({ incomingOutgoing: types_1.IncomingOutgoing.Incoming, nextNodeChainIdForSorting: nextTo, finalOrder: -1 });
        }
        if (segmentDirection === types_1.SegmentDirection.RightToLeft) {
            nodeCoordMap[a.fr].joinsL.push({ incomingOutgoing: types_1.IncomingOutgoing.Outgoing, nextNodeChainIdForSorting: nextFr, finalOrder: -1 });
            nodeCoordMap[a.to].joinsR.push({ incomingOutgoing: types_1.IncomingOutgoing.Incoming, nextNodeChainIdForSorting: nextTo, finalOrder: -1 });
        }
        if (segmentDirection === types_1.SegmentDirection.VerticalAroundDown || segmentDirection === types_1.SegmentDirection.VerticalAroundUp) {
            nodeCoordMap[a.fr].joinsL.push({ incomingOutgoing: types_1.IncomingOutgoing.Outgoing, nextNodeChainIdForSorting: nextFr, finalOrder: -1 });
            nodeCoordMap[a.to].joinsL.push({ incomingOutgoing: types_1.IncomingOutgoing.Incoming, nextNodeChainIdForSorting: nextTo, finalOrder: -1 });
        }
        if (segmentDirection === types_1.SegmentDirection.ImmediateDown) {
            nodeCoordMap[a.fr].joinsB.unshift({ other: a.to, incomingOutgoing: types_1.IncomingOutgoing.Outgoing }); // Use unshift so down is always on left
            nodeCoordMap[a.to].joinsT.unshift({ other: a.fr, incomingOutgoing: types_1.IncomingOutgoing.Incoming }); // Use unshift so down is always on left
        }
        if (segmentDirection === types_1.SegmentDirection.ImmediateUp) {
            nodeCoordMap[a.fr].joinsT.push({ other: a.to, incomingOutgoing: types_1.IncomingOutgoing.Outgoing });
            nodeCoordMap[a.to].joinsB.push({ other: a.fr, incomingOutgoing: types_1.IncomingOutgoing.Incoming });
        }
    });
    var bGoesFirst = -1;
    var cGoesFirst = 1;
    nodes.forEach(function (a) {
        // Sort so that highest join comes first
        nodeCoordMap[a.id].joinsL.sort(function (b, c) {
            var bDir = get_segment_direction_1.getSegmentDirection(a.id, b.nextNodeChainIdForSorting, nodeCoordMap);
            var cDir = get_segment_direction_1.getSegmentDirection(a.id, c.nextNodeChainIdForSorting, nodeCoordMap);
            var bSeq = nodeCoordMap[b.nextNodeChainIdForSorting].sequence;
            var cSeq = nodeCoordMap[c.nextNodeChainIdForSorting].sequence;
            var smallestSequenceGoesFirst = bSeq - cSeq;
            var smallestSequenceGoesLast = cSeq - bSeq;
            // First address special case of same start and end node, i.e. parallel edges, one going each way
            if (b.nextNodeChainIdForSorting === c.nextNodeChainIdForSorting) {
                return b.incomingOutgoing === types_1.IncomingOutgoing.Incoming
                    ? bGoesFirst
                    : cGoesFirst;
            }
            if (bDir === types_1.SegmentDirection.ImmediateUp || bDir === types_1.SegmentDirection.ImmediateDown || cDir === types_1.SegmentDirection.ImmediateUp || cDir === types_1.SegmentDirection.ImmediateDown) {
                throw new Error("Not possible");
            }
            if (bDir === types_1.SegmentDirection.VerticalAroundDown && cDir === types_1.SegmentDirection.VerticalAroundDown) {
                return smallestSequenceGoesLast;
            }
            if (bDir === types_1.SegmentDirection.VerticalAroundUp && cDir === types_1.SegmentDirection.VerticalAroundUp) {
                return smallestSequenceGoesLast;
            }
            if (bDir === types_1.SegmentDirection.VerticalAroundUp && cDir === types_1.SegmentDirection.VerticalAroundDown) {
                return bGoesFirst;
            }
            if (bDir === types_1.SegmentDirection.VerticalAroundDown && cDir === types_1.SegmentDirection.VerticalAroundUp) {
                return cGoesFirst;
            }
            if (bDir === types_1.SegmentDirection.VerticalAroundDown) {
                return cGoesFirst;
            }
            if (bDir === types_1.SegmentDirection.VerticalAroundUp) {
                return bGoesFirst;
            }
            if (cDir === types_1.SegmentDirection.VerticalAroundDown) {
                return bGoesFirst;
            }
            if (cDir === types_1.SegmentDirection.VerticalAroundUp) {
                return cGoesFirst;
            }
            return smallestSequenceGoesFirst;
        });
        // Sort so that highest join comes first
        nodeCoordMap[a.id].joinsR.sort(function (b, c) {
            // First address special case of same start and end node, i.e. parallel edges, one going each way
            if (b.nextNodeChainIdForSorting === c.nextNodeChainIdForSorting) {
                return b.incomingOutgoing === types_1.IncomingOutgoing.Incoming
                    ? cGoesFirst
                    : bGoesFirst;
            }
            // Smallest sequence goes first
            return nodeCoordMap[b.nextNodeChainIdForSorting].sequence - nodeCoordMap[c.nextNodeChainIdForSorting].sequence;
        });
        nodeCoordMap[a.id].joinsL.forEach(function (b, i) {
            b.finalOrder = i;
        });
        nodeCoordMap[a.id].joinsR.forEach(function (b, i) {
            b.finalOrder = i;
        });
    });
}
exports.addAndSortNodeJoins = addAndSortNodeJoins;
function updateNodeCoordMapWithYOffsets(nodes, nodeCoordMap, s) {
    nodes.forEach(function (a) {
        var nc = nodeCoordMap[a.id];
        nc.joinsL.forEach(function (b) {
            var offset = getOffsetSeparatedEdges(nc.h, nc.joinsL.length, b.finalOrder, s);
            nc.yOffsetsUsingInOutKey[get_keys_1.getKeyInOutNext(b.incomingOutgoing, b.nextNodeChainIdForSorting)] = offset;
        });
        nc.joinsR.forEach(function (b) {
            var offset = getOffsetSeparatedEdges(nc.h, nc.joinsR.length, b.finalOrder, s);
            nc.yOffsetsUsingInOutKey[get_keys_1.getKeyInOutNext(b.incomingOutgoing, b.nextNodeChainIdForSorting)] = offset;
        });
    });
}
exports.updateNodeCoordMapWithYOffsets = updateNodeCoordMapWithYOffsets;
function getOffsetSeparatedEdges(h, nJoins, iJoin, s) {
    if (h === 0) {
        return 0;
    }
    if (nJoins === 1) {
        return (h / 2);
    }
    var proposedJoinArea = (nJoins - 1) * s.EDGE_TO_EDGE_VERTICAL_GAP;
    var joinableHeight = h - (2 * s.JOIN_MARGIN);
    if (proposedJoinArea > joinableHeight) {
        if (joinableHeight <= 0) {
            return (h / 2);
        }
        var newJoinGap = joinableHeight / (nJoins - 1);
        return (h / 2) - ((nJoins - 1) * newJoinGap / 2) + (iJoin * newJoinGap);
    }
    return (h / 2) - (proposedJoinArea / 2) + (iJoin * s.EDGE_TO_EDGE_VERTICAL_GAP);
}
function updateNodeCoordMapWithTrackMaps(columns, nodes, nodeCoordMap, s) {
    columns.forEach(function (colInfo) {
        colInfo.segmentsNormalToTheRight.forEach(function (seg) {
            nodeCoordMap[seg.left].trackMapXR_forLeftNodes[get_keys_1.getKeyInOutNext(seg.horizontalDirection === types_1.HorizontalDirection.LeftToRight ? types_1.IncomingOutgoing.Outgoing : types_1.IncomingOutgoing.Incoming, seg.right)] = seg.track;
        });
        colInfo.segmentsAroundToTheLeft.forEach(function (seg) {
            nodeCoordMap[seg.from].trackMapVL_forFromNodes[get_keys_1.getKeyInOutNext(types_1.IncomingOutgoing.Outgoing, seg.to)] = seg.track; // VerticalAround is always "LeftToRight", direction is always "Same"
        });
    });
    // The rest of this function is for the immediate up and down joins
    var halfSep = s.EDGE_TO_EDGE_HORIZONTAL_GAP / 2;
    nodes.forEach(function (node) {
        // TOP
        var nTop = nodeCoordMap[node.id].joinsT.length;
        utils_1.vizAssert(nTop < 3);
        if (nTop === 1) {
            var j1 = nodeCoordMap[node.id].joinsT[0];
            if (j1.incomingOutgoing === types_1.IncomingOutgoing.Incoming) {
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j1.other] = 0;
            }
            else {
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j1.other] = 0;
            }
        }
        if (nTop === 2) {
            var j1 = nodeCoordMap[node.id].joinsT[0];
            var j2 = nodeCoordMap[node.id].joinsT[1];
            if (j1.incomingOutgoing === types_1.IncomingOutgoing.Incoming) {
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j1.other] = 0 - halfSep;
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j2.other] = halfSep;
            }
            else {
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j1.other] = 0 - halfSep;
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j2.other] = halfSep;
            }
        }
        // BOTTOM
        var nBottom = nodeCoordMap[node.id].joinsB.length;
        utils_1.vizAssert(nBottom < 3);
        if (nBottom === 1) {
            var j1 = nodeCoordMap[node.id].joinsB[0];
            if (j1.incomingOutgoing === types_1.IncomingOutgoing.Incoming) {
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j1.other] = 0;
            }
            else {
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j1.other] = 0;
            }
        }
        if (nBottom === 2) {
            var j1 = nodeCoordMap[node.id].joinsB[0];
            var j2 = nodeCoordMap[node.id].joinsB[1];
            if (j1.incomingOutgoing === types_1.IncomingOutgoing.Incoming) {
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j1.other] = 0 - halfSep;
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j2.other] = halfSep;
            }
            else {
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j1.other] = 0 - halfSep;
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j2.other] = halfSep;
            }
        }
    });
}
exports.updateNodeCoordMapWithTrackMaps = updateNodeCoordMapWithTrackMaps;
