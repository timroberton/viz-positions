"use strict";
exports.__esModule = true;
exports.sortSequencing = void 0;
var utils_1 = require("./utils");
function sortSequencing(nodes, columns, nodeCoordMap, s) {
    var initialSequenceWeights = nodes.reduce(function (map, node) {
        if (node.initialSequenceWeight === undefined || node.initialSequenceWeight < 0) {
            throw new Error("All incoming nodes must have initialSequenceWeight (and not -1)");
        }
        map[node.id] = node.initialSequenceWeight;
        return map;
    }, {});
    // This is for the rare case described below
    var tieBreakerWeights = nodes.reduce(function (map, node, i) {
        map[node.id] = i;
        return map;
    }, {});
    var colHeights = [];
    var maxColH = 0;
    columns.forEach(function (colInfo) {
        // Sort nodes by initial sequenceWeight
        colInfo.nodeIds.sort(function (b, c) { return initialSequenceWeights[b] - initialSequenceWeights[c]; });
        // Calculate height of columns
        var colHeight = utils_1.sumWith(colInfo.nodeIds, function (v) { return nodeCoordMap[v].h; });
        maxColH = Math.max(maxColH, colHeight);
        colHeights.push(colHeight);
    });
    var scoreMap = {};
    // Add scores for each real node
    columns.forEach(function (colInfo, i) {
        var colH = colHeights[i];
        var currentY = (maxColH - colH) / 2;
        colInfo.nodeIds.filter(function (nodeId) { return !nodeCoordMap[nodeId].isConnecting; }).forEach(function (nodeId) {
            scoreMap[nodeId] = currentY + (nodeCoordMap[nodeId].h / 2);
            currentY += nodeCoordMap[nodeId].h;
        });
    });
    // Add scores for each connecting node
    columns.forEach(function (colInfo) {
        colInfo.nodeIds.filter(function (nodeId) { return nodeCoordMap[nodeId].isConnecting; }).forEach(function (nodeId) {
            var frSeq = scoreMap[nodeCoordMap[nodeId].endFrIfConnecting];
            var toSeq = scoreMap[nodeCoordMap[nodeId].endToIfConnecting];
            var frLayer = nodeCoordMap[nodeCoordMap[nodeId].endFrIfConnecting].layer;
            var toLayer = nodeCoordMap[nodeCoordMap[nodeId].endToIfConnecting].layer;
            var thisLayer = nodeCoordMap[nodeId].layer;
            var pct = (thisLayer - frLayer) / (toLayer - frLayer);
            scoreMap[nodeId] = frSeq + (pct * (toSeq - frSeq));
        });
    });
    columns.forEach(function (colInfo) {
        // Sort nodes by score
        colInfo.nodeIds.sort(function (b, c) {
            if (scoreMap[b] !== scoreMap[c]) {
                return scoreMap[b] - scoreMap[c];
            }
            // All the rest here is for the rare case when two connecting nodes are the same, but they have different end nodes in different layers
            if (nodeCoordMap[b].isConnecting && nodeCoordMap[c].isConnecting) {
                return tieBreakerWeights[nodeCoordMap[b].endFrIfConnecting] - tieBreakerWeights[nodeCoordMap[c].endFrIfConnecting];
            }
            if (nodeCoordMap[b].isConnecting) {
                return tieBreakerWeights[nodeCoordMap[b].endFrIfConnecting] - tieBreakerWeights[c];
            }
            if (nodeCoordMap[c].isConnecting) {
                return tieBreakerWeights[b] - tieBreakerWeights[nodeCoordMap[c].endFrIfConnecting];
            }
            return tieBreakerWeights[b] - tieBreakerWeights[c];
        });
        // Add sorting to nodeCoordMap properties
        // All nodes
        colInfo.nodeIds.forEach(function (nodeId, i) {
            nodeCoordMap[nodeId].sequence = i;
        });
        // Only non-connecting nodes
        colInfo.nodeIds.filter(function (nodeId) { return !nodeCoordMap[nodeId].isConnecting; }).forEach(function (nodeId, i) {
            nodeCoordMap[nodeId].sequenceIgnoringConnectingNodes = i;
        });
    });
}
exports.sortSequencing = sortSequencing;
