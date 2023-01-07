"use strict";
exports.__esModule = true;
exports.getKeyInOutNext = void 0;
var types_1 = require("./types");
function getKeyInOutNext(incomingOutgoing, nextNodeId) {
    switch (incomingOutgoing) {
        case types_1.IncomingOutgoing.Incoming:
            return "incoming-fromnext-" + nextNodeId;
        case types_1.IncomingOutgoing.Outgoing:
            return "outgoing-tonext-" + nextNodeId;
        default:
            throw new Error("Not possible");
    }
}
exports.getKeyInOutNext = getKeyInOutNext;
