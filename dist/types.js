"use strict";
exports.__esModule = true;
exports.SegmentDirection = exports.HorizontalDirection = exports.IncomingOutgoing = void 0;
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
var IncomingOutgoing;
(function (IncomingOutgoing) {
    IncomingOutgoing["Incoming"] = "Incoming";
    IncomingOutgoing["Outgoing"] = "Outgoing";
})(IncomingOutgoing = exports.IncomingOutgoing || (exports.IncomingOutgoing = {}));
var HorizontalDirection;
(function (HorizontalDirection) {
    HorizontalDirection["LeftToRight"] = "LeftToRight";
    HorizontalDirection["RightToLeft"] = "RightToLeft";
    HorizontalDirection["Same"] = "Same";
})(HorizontalDirection = exports.HorizontalDirection || (exports.HorizontalDirection = {}));
var SegmentDirection;
(function (SegmentDirection) {
    SegmentDirection["LeftToRight"] = "LeftToRight";
    SegmentDirection["RightToLeft"] = "RightToLeft";
    SegmentDirection["VerticalAroundUp"] = "VerticalAroundUp";
    SegmentDirection["VerticalAroundDown"] = "VerticalAroundDown";
    SegmentDirection["ImmediateUp"] = "ImmediateUp";
    SegmentDirection["ImmediateDown"] = "ImmediateDown";
})(SegmentDirection = exports.SegmentDirection || (exports.SegmentDirection = {}));
