"use strict";
exports.__esModule = true;
exports.createBendsMap = void 0;
var get_segment_direction_1 = require("./get_segment_direction");
var get_keys_1 = require("./get_keys");
var types_1 = require("./types");
var utils_1 = require("./utils");
function createBendsMap(edges, columns, nodeCoordMap, edgeCoordMap, s) {
    edges.forEach(function (edge) {
        var edgeCoords = edgeCoordMap[edge.id];
        for (var i = 1; i < edgeCoords.nodeChain.length; i++) { // NOTE: Start at 1
            var fr = edgeCoords.nodeChain[i - 1];
            var to = edgeCoords.nodeChain[i];
            var segmentDirection = get_segment_direction_1.getSegmentDirection(fr, to, nodeCoordMap);
            var isImmediate = segmentDirection === types_1.SegmentDirection.ImmediateDown || segmentDirection === types_1.SegmentDirection.ImmediateUp;
            var isFirstSegment = i === 1;
            var isLastSegment = i === edgeCoords.nodeChain.length - 1;
            var frNCM = nodeCoordMap[fr];
            var toNCM = nodeCoordMap[to];
            var frCol = columns[frNCM.layer];
            var toCol = columns[toNCM.layer];
            var frOffset = frNCM.isConnecting
                ? 0
                : (isImmediate
                    ? frNCM.immediateOffsetMapOutgoing[to]
                    : frNCM.yOffsetsUsingInOutKey[get_keys_1.getKeyInOutNext(types_1.IncomingOutgoing.Outgoing, to)]);
            var toOffset = toNCM.isConnecting
                ? 0
                : (isImmediate
                    ? toNCM.immediateOffsetMapIncoming[fr]
                    : toNCM.yOffsetsUsingInOutKey[get_keys_1.getKeyInOutNext(types_1.IncomingOutgoing.Incoming, fr)]);
            switch (segmentDirection) {
                case types_1.SegmentDirection.LeftToRight:
                    var track1 = frNCM.trackMapXR_forLeftNodes[get_keys_1.getKeyInOutNext(types_1.IncomingOutgoing.Outgoing, to)];
                    // console.log("T1", track1, frOffset, toOffset)
                    edgeCoords.edgeSegments.push({
                        fr: fr,
                        to: to,
                        segmentDirection: segmentDirection,
                        frX: frNCM.x + frNCM.w,
                        frY: frNCM.y + frOffset,
                        toX: toNCM.x,
                        toY: toNCM.y + toOffset,
                        trackX: frCol.edgeVR + (track1 * s.EDGE_TO_EDGE_VERTICAL_GAP),
                        trackBayStart: frCol.edgeVR,
                        trackBayEnd: (frNCM.x + toNCM.x) / 2,
                        isFirstSegment: isFirstSegment,
                        isLastSegment: isLastSegment
                    });
                    break;
                case types_1.SegmentDirection.RightToLeft:
                    var track2 = toNCM.trackMapXR_forLeftNodes[get_keys_1.getKeyInOutNext(types_1.IncomingOutgoing.Incoming, fr)];
                    // console.log(track2, frOffset, toOffset)
                    edgeCoords.edgeSegments.push({
                        fr: fr,
                        to: to,
                        segmentDirection: segmentDirection,
                        frX: frNCM.x,
                        frY: frNCM.y + frOffset,
                        toX: toNCM.x + toNCM.w,
                        toY: toNCM.y + toOffset,
                        trackX: toCol.edgeVR + (track2 * s.EDGE_TO_EDGE_VERTICAL_GAP),
                        trackBayStart: toCol.edgeVR,
                        trackBayEnd: (frNCM.x + toNCM.x) / 2,
                        isFirstSegment: isFirstSegment,
                        isLastSegment: isLastSegment
                    });
                    break;
                case types_1.SegmentDirection.VerticalAroundDown:
                    utils_1.vizAssert(frCol === toCol);
                    var track3 = frNCM.trackMapVL_forFromNodes[get_keys_1.getKeyInOutNext(types_1.IncomingOutgoing.Outgoing, to)];
                    // console.log("T3", track3, frOffset, toOffset)
                    edgeCoords.edgeSegments.push({
                        fr: fr,
                        to: to,
                        segmentDirection: segmentDirection,
                        frX: frNCM.x,
                        frY: frNCM.y + frOffset,
                        toX: toNCM.x,
                        toY: toNCM.y + toOffset,
                        trackX: frCol.edgeVL + (track3 * s.EDGE_TO_EDGE_VERTICAL_GAP),
                        trackBayStart: frCol.edgeVL,
                        trackBayEnd: (frNCM.x + toNCM.x) / 2,
                        isFirstSegment: isFirstSegment,
                        isLastSegment: isLastSegment
                    });
                    break;
                case types_1.SegmentDirection.VerticalAroundUp:
                    utils_1.vizAssert(frCol === toCol);
                    var track4 = frNCM.trackMapVL_forFromNodes[get_keys_1.getKeyInOutNext(types_1.IncomingOutgoing.Outgoing, to)];
                    // console.log("T3", track3, frOffset, toOffset)
                    edgeCoords.edgeSegments.push({
                        fr: fr,
                        to: to,
                        segmentDirection: segmentDirection,
                        frX: frNCM.x,
                        frY: frNCM.y + frOffset,
                        toX: toNCM.x,
                        toY: toNCM.y + toOffset,
                        trackX: frCol.edgeVL + (track4 * s.EDGE_TO_EDGE_VERTICAL_GAP),
                        trackBayStart: frCol.edgeVL,
                        trackBayEnd: (frNCM.x + toNCM.x) / 2,
                        isFirstSegment: isFirstSegment,
                        isLastSegment: isLastSegment
                    });
                    break;
                case types_1.SegmentDirection.ImmediateDown:
                    edgeCoords.edgeSegments.push({
                        fr: fr,
                        to: to,
                        segmentDirection: segmentDirection,
                        frX: frNCM.x + (frNCM.w / 2) + frOffset,
                        frY: frNCM.y + frNCM.h,
                        toX: toNCM.x + (toNCM.w / 2) + toOffset,
                        toY: toNCM.y,
                        trackX: -1,
                        trackBayStart: -1,
                        trackBayEnd: -1,
                        isFirstSegment: isFirstSegment,
                        isLastSegment: isLastSegment
                    });
                    break;
                case types_1.SegmentDirection.ImmediateUp:
                    edgeCoords.edgeSegments.push({
                        fr: fr,
                        to: to,
                        segmentDirection: segmentDirection,
                        frX: frNCM.x + (frNCM.w / 2) + frOffset,
                        frY: frNCM.y,
                        toX: toNCM.x + (toNCM.w / 2) + toOffset,
                        toY: toNCM.y + toNCM.h,
                        trackX: -1,
                        trackBayStart: -1,
                        trackBayEnd: -1,
                        isFirstSegment: isFirstSegment,
                        isLastSegment: isLastSegment
                    });
                    break;
            }
        }
    });
}
exports.createBendsMap = createBendsMap;
