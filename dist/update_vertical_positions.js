"use strict";
exports.__esModule = true;
exports.updateVerticalPositions = void 0;
var types_style_1 = require("./types_style");
var utils_1 = require("./utils");
function updateVerticalPositions(columns, nodeCoordMap, s) {
    var maxHColIndex = initialVerticalPositions(columns, nodeCoordMap, s);
    if (s.VERTICAL_SPACING === types_style_1.VERTICAL_SPACING.automatic) {
        improveVerticalPositions(columns, nodeCoordMap, maxHColIndex, s);
    }
}
exports.updateVerticalPositions = updateVerticalPositions;
function initialVerticalPositions(columns, nodeCoordMap, s) {
    var heights = [];
    var maxH = -1;
    var maxHColIndex = -1;
    columns.forEach(function (colInfo, colIndex) {
        var current = 0;
        for (var i = 0; i < colInfo.nodeIds.length; i++) {
            var id = colInfo.nodeIds[i];
            nodeCoordMap[id].y = current;
            var nextId = colInfo.nodeIds[i + 1];
            var gap = nextId
                ? (isEdgeToEdgeGap(nodeCoordMap[id], nodeCoordMap[nextId]) ? s.EDGE_TO_EDGE_VERTICAL_GAP : s.NODE_VERTICAL_GAP)
                : 0;
            current += nodeCoordMap[id].h + gap;
        }
        heights.push(current);
        if (current > maxH) {
            maxH = current;
            maxHColIndex = colIndex;
        }
    });
    if (s.VERTICAL_SPACING !== types_style_1.VERTICAL_SPACING.top) {
        columns.forEach(function (colInfo, i) {
            var diff = maxH - heights[i];
            var halfDiff = diff / 2;
            colInfo.nodeIds.forEach(function (id) {
                nodeCoordMap[id].y += halfDiff;
            });
        });
    }
    return maxHColIndex;
}
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
function improveVerticalPositions(columns, nodeCoordMap, maxHColIndex, s) {
    for (var i = maxHColIndex - 1; i >= 0; i--) { // Note go down (right to left) STARTING FROM JUST AFTER MAXH LAYER
        doOneLayer(columns, nodeCoordMap, i, true, s);
    }
    for (var i = maxHColIndex + 1; i < columns.length; i++) { // Note go up (left to right) STARTING FROM JUST AFTER MAXH LAYER
        doOneLayer(columns, nodeCoordMap, i, false, s);
    }
}
function doOneLayer(columns, nodeCoordMap, iLayer, compareToRight, s) {
    var colInfo = columns[iLayer];
    var mapOfConnections = compareToRight
        ? columns[iLayer].keyIsLeftOtherIsRight
        : columns[iLayer].keyIsRightOtherIsLeft;
    // Get initial ideal Ys
    colInfo.nodeIds.forEach(function (id) {
        var _a = getIdealYAndYC(id, mapOfConnections[id], nodeCoordMap), y = _a.y, yc = _a.yc;
        nodeCoordMap[id].y = y;
    });
    doBudging(nodeCoordMap, colInfo.nodeIds, mapOfConnections, s);
}
function getIdealYAndYC(id, nodesToAvg, nodeCoordMap) {
    if (nodesToAvg.length === 0) {
        return { y: nodeCoordMap[id].y, yc: nodeCoordMap[id].y + (nodeCoordMap[id].h / 2) };
    }
    if (nodesToAvg.length === 1) {
        var connection = nodesToAvg[0];
        var yc_1 = nodeCoordMap[connection.other].y + connection.offsetOther;
        return { y: yc_1 - connection.offsetSelf, yc: yc_1 };
    }
    var yVals = nodesToAvg.map(function (connection) { return nodeCoordMap[connection.other].y + connection.offsetOther; });
    var avgSourceOffset = utils_1.sumWith(nodesToAvg, function (connection) { return connection.offsetSelf; }) / nodesToAvg.length;
    var yc = utils_1.sum(yVals) / yVals.length;
    return { y: yc - avgSourceOffset, yc: yc };
}
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
function doBudging(nodeCoordMap, columnNodeIds, mapOfConnections, s) {
    var idsInLowToHighPriority = getLowToHighPriorityOrder(nodeCoordMap, columnNodeIds, mapOfConnections);
    var alreadyBudged = [];
    for (var i = 0; i < idsInLowToHighPriority.length; i++) {
        addAndBudge(nodeCoordMap, idsInLowToHighPriority[i], alreadyBudged, columnNodeIds, s);
    }
}
function getLowToHighPriorityOrder(nodeCoordMap, columnNodeIds, mapOfConnections) {
    var midIndex = Math.floor(columnNodeIds.length / 2);
    var weights = columnNodeIds.map(function (v, i) {
        var numberOfEdges = mapOfConnections[v].length;
        var isDummyNode = nodeCoordMap[v].isConnecting ? 1000 : 0;
        var centerPriorityLevel = midIndex - Math.abs(i - midIndex);
        return {
            id: v,
            weight: isDummyNode + (numberOfEdges * 100) + centerPriorityLevel
        };
    });
    weights.sort(function (a, b) { return a.weight - b.weight; });
    return weights.map(function (v) { return v.id; });
}
function addAndBudge(nodeCoordMap, id, alreadyBudged, columnNodeIds, s) {
    alreadyBudged.push(id);
    alreadyBudged.sort(function (a, b) { return columnNodeIds.indexOf(a) - columnNodeIds.indexOf(b); });
    var startIndex = alreadyBudged.indexOf(id);
    var goingUp = alreadyBudged.slice(0, startIndex + 1).reverse();
    var goingDown = alreadyBudged.slice(startIndex);
    budge(nodeCoordMap, goingUp, true, s);
    budge(nodeCoordMap, goingDown, false, s);
}
function budge(nodeCoordMap, idsInOrder, isGoingUp, s) {
    for (var i = 1; i < idsInOrder.length; i++) { // Start from 1
        var prevId = idsInOrder[i - 1];
        var prevNodeCoords = nodeCoordMap[prevId];
        var id = idsInOrder[i];
        var nodeCoords = nodeCoordMap[id];
        var gap = isEdgeToEdgeGap(prevNodeCoords, nodeCoords) ? s.EDGE_TO_EDGE_VERTICAL_GAP : s.NODE_VERTICAL_GAP;
        if (isGoingUp) {
            var maximum = prevNodeCoords.y - nodeCoords.h - gap;
            if (nodeCoords.y > maximum) {
                nodeCoords.y = maximum;
            }
        }
        else {
            var minimum = prevNodeCoords.y + prevNodeCoords.h + gap;
            if (nodeCoords.y < minimum) {
                nodeCoords.y = minimum;
            }
        }
    }
}
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
function isEdgeToEdgeGap(n1, n2) {
    return n1.isConnecting && n2.isConnecting;
}
