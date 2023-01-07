"use strict";
exports.__esModule = true;
exports.addPathData = void 0;
var types_1 = require("./types");
var types_style_1 = require("./types_style");
function addPathData(edges, edgeCoordMap, s) {
    edges.forEach(function (edge) {
        var ew = edge.strokeWidthForArrowCrop;
        var sm = s.EDGE_SMOOTHING;
        var ec = edgeCoordMap[edge.id];
        switch (s.EDGE_FORMAT) {
            case types_style_1.EDGE_FORMAT.classic:
                ec.pathData = getPathDataStraight(ec.edgeSegments, ew, sm);
                return;
            case types_style_1.EDGE_FORMAT.straight:
                ec.pathData = getPathDataStraight(ec.edgeSegments, ew, sm);
                return;
        }
    });
}
exports.addPathData = addPathData;
function getPathDataStraight(edgeSegments, ew, smoothing) {
    var startX = edgeSegments[0].frX;
    var startY = edgeSegments[0].frY;
    var d = "M " + startX + " " + startY;
    var nFillers = 16 - edgeSegments.length;
    for (var i = 0; i < nFillers; i++) {
        d += " C " + startX + "," + startY + " " + startX + "," + startY + " " + startX + "," + startY + " L " + startX + "," + startY + " C " + startX + "," + startY + " " + startX + "," + startY + " " + startX + "," + startY;
    }
    var _MAX_DELTA_LENGTH = smoothing;
    var _MIN_ANGLE_DISPLACEMENT_THRESHOLD = 8;
    return edgeSegments.reduce(function (acu, sg) {
        if (sg.isLastSegment) {
            cropLastBendForArrow(sg, ew);
        }
        var deltaLength = Math.min(Math.abs(sg.toY - sg.frY) / 2, _MAX_DELTA_LENGTH);
        var d = deltaLength * Math.sign(sg.toY - sg.frY); // positive is for "going down";
        // Angle displacement (left and right)
        var ADL = 0;
        var ADR = 0;
        var useAngleDisplacement = (deltaLength < _MIN_ANGLE_DISPLACEMENT_THRESHOLD);
        if (useAngleDisplacement) {
            var xdL = sg.trackX - sg.frX;
            var xdR = sg.toX - sg.trackX;
            var halfMinXD = Math.min(Math.abs(xdL), Math.abs(xdR)) / 2;
            var AD = halfMinXD * (1 - (deltaLength / _MIN_ANGLE_DISPLACEMENT_THRESHOLD));
            ADL = AD * Math.sign(xdL);
            ADR = AD * Math.sign(xdR);
        }
        if (sg.segmentDirection === types_1.SegmentDirection.LeftToRight ||
            sg.segmentDirection === types_1.SegmentDirection.RightToLeft ||
            sg.segmentDirection === types_1.SegmentDirection.VerticalAroundDown ||
            sg.segmentDirection === types_1.SegmentDirection.VerticalAroundUp) {
            return acu + (" C " + (sg.trackX - ADL) + "," + sg.frY + " " + (sg.trackX - ADL) + "," + sg.frY + " " + sg.trackX + "," + (sg.frY + d) + " L " + sg.trackX + "," + (sg.toY - d) + " C " + (sg.trackX + ADR) + "," + sg.toY + " " + (sg.trackX + ADR) + "," + sg.toY + " " + sg.toX + "," + sg.toY);
        }
        if (sg.segmentDirection === types_1.SegmentDirection.ImmediateDown ||
            sg.segmentDirection === types_1.SegmentDirection.ImmediateUp) {
            return acu + (" C " + sg.frX + "," + sg.frY + " " + sg.frX + "," + sg.frY + " " + sg.frX + "," + sg.frY + " L " + sg.toX + "," + sg.toY + " C " + sg.toX + "," + sg.toY + " " + sg.toX + "," + sg.frY + " " + sg.toX + "," + sg.toY);
        }
        throw new Error("Should not reach here");
    }, d);
}
function cropLastBendForArrow(seg, ew) {
    var _CROP_LENGTH = ew;
    switch (seg.segmentDirection) {
        case types_1.SegmentDirection.LeftToRight:
            seg.toX -= _CROP_LENGTH;
            break;
        case types_1.SegmentDirection.RightToLeft:
            seg.toX += _CROP_LENGTH;
            break;
        case types_1.SegmentDirection.VerticalAroundDown:
            seg.toX -= _CROP_LENGTH;
            break;
        case types_1.SegmentDirection.VerticalAroundUp:
            seg.toX -= _CROP_LENGTH;
            break;
        case types_1.SegmentDirection.ImmediateDown:
            seg.toY -= _CROP_LENGTH;
            break;
        case types_1.SegmentDirection.ImmediateUp:
            seg.toY += _CROP_LENGTH;
            break;
    }
}
