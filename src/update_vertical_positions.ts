import { NodeCoordMap, FromToMapper, FromToConnection, Columns, NodeCoords } from "./types";
import { PositionStyle, VERTICAL_SPACING } from "./types_style";
import { sum, sumWith } from "./utils";

export function updateVerticalPositions(columns: Columns, nodeCoordMap: NodeCoordMap, s: PositionStyle): void {
    const maxHColIndex = initialVerticalPositions(columns, nodeCoordMap, s);
    if (s.VERTICAL_SPACING === VERTICAL_SPACING.automatic) {
        improveVerticalPositions(columns, nodeCoordMap, maxHColIndex, s);
    }
}

function initialVerticalPositions(columns: Columns, nodeCoordMap: NodeCoordMap, s: PositionStyle): number {

    const heights: number[] = [];
    let maxH = -1;
    let maxHColIndex = -1;

    columns.forEach((colInfo, colIndex) => {
        let current = 0;
        for (let i = 0; i < colInfo.nodeIds.length; i++) {
            const id = colInfo.nodeIds[i];
            nodeCoordMap[id].y = current;
            const nextId = colInfo.nodeIds[i + 1];
            const gap = nextId
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

    if (s.VERTICAL_SPACING !== VERTICAL_SPACING.top) {
        columns.forEach((colInfo, i) => {
            const diff = maxH - heights[i];
            const halfDiff = diff / 2;
            colInfo.nodeIds.forEach(id => {
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

function improveVerticalPositions(columns: Columns, nodeCoordMap: NodeCoordMap, maxHColIndex: number, s: PositionStyle): void {
    for (let i = maxHColIndex - 1; i >= 0; i--) { // Note go down (right to left) STARTING FROM JUST AFTER MAXH LAYER
        doOneLayer(columns, nodeCoordMap, i, true, s);
    }
    for (let i = maxHColIndex + 1; i < columns.length; i++) { // Note go up (left to right) STARTING FROM JUST AFTER MAXH LAYER
        doOneLayer(columns, nodeCoordMap, i, false, s);
    }
}

function doOneLayer(columns: Columns, nodeCoordMap: NodeCoordMap, iLayer: number, compareToRight: boolean, s: PositionStyle): void {
    const colInfo = columns[iLayer];
    const mapOfConnections = compareToRight
        ? columns[iLayer].keyIsLeftOtherIsRight
        : columns[iLayer].keyIsRightOtherIsLeft;
    // Get initial ideal Ys
    colInfo.nodeIds.forEach(id => {
        const { y, yc } = getIdealYAndYC(id, mapOfConnections[id], nodeCoordMap);
        nodeCoordMap[id].y = y;
    });
    doBudging(nodeCoordMap, colInfo.nodeIds, mapOfConnections, s);
}

function getIdealYAndYC(id: string, nodesToAvg: FromToConnection[], nodeCoordMap: NodeCoordMap): { y: number, yc: number } {
    if (nodesToAvg.length === 0) {
        return { y: nodeCoordMap[id].y, yc: nodeCoordMap[id].y + (nodeCoordMap[id].h / 2) };
    }
    if (nodesToAvg.length === 1) {
        const connection = nodesToAvg[0];
        const yc = nodeCoordMap[connection.other].y + connection.offsetOther;
        return { y: yc - connection.offsetSelf, yc };
    }
    const yVals = nodesToAvg.map(connection => nodeCoordMap[connection.other].y + connection.offsetOther);
    const avgSourceOffset = sumWith(nodesToAvg, connection => connection.offsetSelf) / nodesToAvg.length;
    const yc = sum(yVals) / yVals.length;
    return { y: yc - avgSourceOffset, yc };
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

function doBudging(nodeCoordMap: NodeCoordMap, columnNodeIds: string[], mapOfConnections: FromToMapper, s: PositionStyle): void {
    const idsInLowToHighPriority = getLowToHighPriorityOrder(nodeCoordMap, columnNodeIds, mapOfConnections);
    const alreadyBudged: string[] = [];
    for (let i = 0; i < idsInLowToHighPriority.length; i++) {
        addAndBudge(nodeCoordMap, idsInLowToHighPriority[i], alreadyBudged, columnNodeIds, s);
    }
}

function getLowToHighPriorityOrder(nodeCoordMap: NodeCoordMap, columnNodeIds: string[], mapOfConnections: FromToMapper): string[] {
    const midIndex = Math.floor(columnNodeIds.length / 2);
    const weights = columnNodeIds.map((v, i) => {
        const numberOfEdges = mapOfConnections[v].length;
        const isDummyNode = nodeCoordMap[v].isConnecting ? 1000 : 0;
        const centerPriorityLevel = midIndex - Math.abs(i - midIndex);
        return {
            id: v,
            weight: isDummyNode + (numberOfEdges * 100) + centerPriorityLevel,
            // weight: nodeCoordMap[v].h,
        };
    });
    weights.sort((a, b) => a.weight - b.weight);
    return weights.map(v => v.id);
}

function addAndBudge(nodeCoordMap: NodeCoordMap, id: string, alreadyBudged: string[], columnNodeIds: string[], s: PositionStyle): void {
    alreadyBudged.push(id);
    alreadyBudged.sort((a, b) => columnNodeIds.indexOf(a) - columnNodeIds.indexOf(b));
    const startIndex = alreadyBudged.indexOf(id);
    const goingUp = alreadyBudged.slice(0, startIndex + 1).reverse();
    const goingDown = alreadyBudged.slice(startIndex);
    budge(nodeCoordMap, goingUp, true, s);
    budge(nodeCoordMap, goingDown, false, s);
}

function budge(nodeCoordMap: NodeCoordMap, idsInOrder: string[], isGoingUp: boolean, s: PositionStyle): void {
    for (let i = 1; i < idsInOrder.length; i++) { // Start from 1
        const prevId = idsInOrder[i - 1];
        const prevNodeCoords = nodeCoordMap[prevId];
        const id = idsInOrder[i];
        const nodeCoords = nodeCoordMap[id];

        const gap = isEdgeToEdgeGap(prevNodeCoords, nodeCoords) ? s.EDGE_TO_EDGE_VERTICAL_GAP : s.NODE_VERTICAL_GAP;

        if (isGoingUp) {
            const maximum = prevNodeCoords.y - nodeCoords.h - gap;
            if (nodeCoords.y > maximum) {
                nodeCoords.y = maximum;
            }
        } else {
            const minimum = prevNodeCoords.y + prevNodeCoords.h + gap;
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

function isEdgeToEdgeGap(n1: NodeCoords, n2: NodeCoords): boolean {
    return n1.isConnecting && n2.isConnecting;
}