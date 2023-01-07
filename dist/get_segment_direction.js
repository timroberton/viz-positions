"use strict";
exports.__esModule = true;
exports.getSegmentDirection = void 0;
var types_1 = require("./types");
function getSegmentDirection(frId, toId, nodeCoordMap) {
    var frNC = nodeCoordMap[frId];
    var toNC = nodeCoordMap[toId];
    if (!frNC || !toNC) {
        throw new Error("Should not be possible");
    }
    if (frNC.layer < toNC.layer) {
        return types_1.SegmentDirection.LeftToRight;
    }
    if (frNC.layer > toNC.layer) {
        return types_1.SegmentDirection.RightToLeft;
    }
    if (frNC.isConnecting || toNC.isConnecting) {
        throw new Error("Should not be possible");
    }
    if (toNC.sequenceIgnoringConnectingNodes === frNC.sequenceIgnoringConnectingNodes + 1) {
        return types_1.SegmentDirection.ImmediateDown;
    }
    if (toNC.sequenceIgnoringConnectingNodes === frNC.sequenceIgnoringConnectingNodes - 1) {
        return types_1.SegmentDirection.ImmediateUp;
    }
    if (frNC.sequenceIgnoringConnectingNodes < toNC.sequenceIgnoringConnectingNodes) {
        return types_1.SegmentDirection.VerticalAroundDown;
    }
    return types_1.SegmentDirection.VerticalAroundUp;
}
exports.getSegmentDirection = getSegmentDirection;
