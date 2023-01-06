import { NodeCoordMap, Columns } from "./types";
import { Node } from "./types_incoming";
import { PositionStyle } from "./types_style";
import { sumWith } from "./utils";

type InitialSequenceWeightMap = { [key: string]: number };
type ColumnHeights = number[];
type ScoreMap = { [key: string]: number };

export function sortSequencing(nodes: Node[], columns: Columns, nodeCoordMap: NodeCoordMap, s: PositionStyle) {

    const initialSequenceWeights = nodes.reduce<InitialSequenceWeightMap>((map, node) => {
        if (node.initialSequenceWeight === undefined || node.initialSequenceWeight < 0) {
            throw new Error("All incoming nodes must have initialSequenceWeight (and not -1)");
        }
        map[node.id] = node.initialSequenceWeight;
        return map;
    }, {});

    // This is for the rare case described below
    const tieBreakerWeights = nodes.reduce<InitialSequenceWeightMap>((map, node, i) => {
        map[node.id] = i;
        return map;
    }, {});

    const colHeights: ColumnHeights = [];
    let maxColH = 0;

    columns.forEach(colInfo => {
        // Sort nodes by initial sequenceWeight
        colInfo.nodeIds.sort((b, c) => initialSequenceWeights[b] - initialSequenceWeights[c]);
        // Calculate height of columns
        const colHeight = sumWith(colInfo.nodeIds, v => nodeCoordMap[v].h);
        maxColH = Math.max(maxColH, colHeight);
        colHeights.push(colHeight);
    });

    const scoreMap: ScoreMap = {};

    // Add scores for each real node
    columns.forEach((colInfo, i) => {
        const colH = colHeights[i];
        let currentY = (maxColH - colH) / 2;
        colInfo.nodeIds.filter(nodeId => !nodeCoordMap[nodeId].isConnecting).forEach(nodeId => {
            scoreMap[nodeId] = currentY + (nodeCoordMap[nodeId].h / 2);
            currentY += nodeCoordMap[nodeId].h;
        });
    });

    // Add scores for each connecting node
    columns.forEach(colInfo => {
        colInfo.nodeIds.filter(nodeId => nodeCoordMap[nodeId].isConnecting).forEach(nodeId => {
            const frSeq = scoreMap[nodeCoordMap[nodeId].endFrIfConnecting];
            const toSeq = scoreMap[nodeCoordMap[nodeId].endToIfConnecting];
            const frLayer = nodeCoordMap[nodeCoordMap[nodeId].endFrIfConnecting].layer;
            const toLayer = nodeCoordMap[nodeCoordMap[nodeId].endToIfConnecting].layer;
            const thisLayer = nodeCoordMap[nodeId].layer
            const pct = (thisLayer - frLayer) / (toLayer - frLayer);
            scoreMap[nodeId] = frSeq + (pct * (toSeq - frSeq));
        });
    });

    columns.forEach(colInfo => {
        // Sort nodes by score
        colInfo.nodeIds.sort((b, c) => {
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
        colInfo.nodeIds.forEach((nodeId, i) => {
            nodeCoordMap[nodeId].sequence = i;
        });
        // Only non-connecting nodes
        colInfo.nodeIds.filter(nodeId => !nodeCoordMap[nodeId].isConnecting).forEach((nodeId, i) => {
            nodeCoordMap[nodeId].sequenceIgnoringConnectingNodes = i;
        });
    });

}
