"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.addConnectingNodes = void 0;
var create_node_coord_map_1 = require("./create_node_coord_map");
function addConnectingNodes(nodes, edges, nodeCoordMap, edgeCoordMap, columns) {
    edges.forEach(function (edge) {
        var frNode = nodes.find(function (a) { return a.id === edge.fr; });
        var toNode = nodes.find(function (a) { return a.id === edge.to; });
        if (frNode === undefined || toNode === undefined) {
            throw new Error("Should not be possible 101");
        }
        var frLayer = nodeCoordMap[edge.fr].layer;
        var toLayer = nodeCoordMap[edge.to].layer;
        var mids = [];
        if (toLayer > frLayer) {
            for (var i = frLayer + 1; i < toLayer; i++) {
                // Start at +1
                var id = edge.id + "-connecting-" + i;
                mids.push(id);
                if (!columns[i].nodeIds.includes(id)) {
                    columns[i].nodeIds.push(id);
                    nodeCoordMap[id] = create_node_coord_map_1.newNodeCoords(0, 0, true, i, edge.fr, edge.to);
                }
            }
        }
        if (toLayer < frLayer) {
            for (var i = frLayer - 1; i > toLayer; i--) {
                // Start at -1
                var id = edge.id + "-connecting-" + i;
                mids.push(id);
                if (!columns[i].nodeIds.includes(id)) {
                    columns[i].nodeIds.push(id);
                    nodeCoordMap[id] = create_node_coord_map_1.newNodeCoords(0, 0, true, i, edge.fr, edge.to);
                }
            }
        }
        edgeCoordMap[edge.id].nodeChain = __spreadArray(__spreadArray([edge.fr], mids), [edge.to]);
    });
}
exports.addConnectingNodes = addConnectingNodes;
