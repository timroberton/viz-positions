import { Edge, Node, Tile } from "./types_incoming";
import { Columns, EdgeCoordMap, HorizontalDirection, IncomingOutgoing, NodeCoordMap, NodeCoords, SegmentDirection, TileCoordMap } from "./types";
import { vizAssert } from "./utils";
import { getSegmentDirection } from "./get_segment_direction";
import { getKeyInOutNext } from "./get_keys";
import { PositionStyle } from "./types_style";

export function createNodeCoordMap(nodes: Node[]): NodeCoordMap {
    return nodes.reduce<NodeCoordMap>((map, node) => {
        map[node.id] = newNodeCoords(node.w, node.h, false, node.layer, "", "");
        return map;
    }, {});
}

export function newNodeCoords(w: number, h: number, isConnecting: boolean, layer: number, endFrIfConnecting: string, endToIfConnecting: string,): NodeCoords {
    return {
        w,
        h,
        isConnecting,
        endFrIfConnecting,
        endToIfConnecting,
        //
        layer,
        sequence: -1,
        sequenceIgnoringConnectingNodes: -1,
        //
        x: -1,
        y: -1,
        //
        colXL: -1,
        colXR: -1,
        colVL: -1,
        trackMapXR_forLeftNodes: {},
        trackMapVL_forFromNodes: {},
        immediateOffsetMapIncoming: {},
        immediateOffsetMapOutgoing: {},
        //
        joinsL: [],
        joinsR: [],
        joinsT: [],
        joinsB: [],
        yOffsetsUsingInOutKey: {},
    };
}

export function createEdgeCoordMap(edges: Edge[]): EdgeCoordMap {
    return edges.reduce<EdgeCoordMap>((map, edge) => {
        map[edge.id] = {
            id: edge.id,
            fr: edge.fr,
            to: edge.to,
            nodeChain: [],
            edgeSegments: [],
            pathData: "",
        };
        return map;
    }, {});
}

export function createTileCoordMap(tiles: Tile[]): TileCoordMap {
    return tiles.reduce<TileCoordMap>((map, edge) => {
        map[edge.id] = {
            finalFromLayer: -1,
            finalToLayer: -1,
            joinL: false,
            joinR: false,
            //
            xl: -1,
            xr: -1,
            yt: -1,
            yb: -1,
        };
        return map;
    }, {});
}

export function addAndSortNodeJoins(nodes: Node[], edges: Edge[], nodeCoordMap: NodeCoordMap, edgeCoordMap: EdgeCoordMap): void {

    edges.forEach(a => {
        const nodeChain = edgeCoordMap[a.id].nodeChain;
        vizAssert(nodeChain.length >= 2);
        const nextFr = nodeChain[1];
        const nextTo = nodeChain[nodeChain.length - 2];
        const segmentDirection = getSegmentDirection(a.fr, a.to, nodeCoordMap); // Note: Ok to use originalFr/originalTo for this particular function call, since only need crude direction
        if (segmentDirection === SegmentDirection.LeftToRight) {
            nodeCoordMap[a.fr].joinsR.push({ incomingOutgoing: IncomingOutgoing.Outgoing, nextNodeChainIdForSorting: nextFr, finalOrder: -1 });
            nodeCoordMap[a.to].joinsL.push({ incomingOutgoing: IncomingOutgoing.Incoming, nextNodeChainIdForSorting: nextTo, finalOrder: -1 });
        }
        if (segmentDirection === SegmentDirection.RightToLeft) {
            nodeCoordMap[a.fr].joinsL.push({ incomingOutgoing: IncomingOutgoing.Outgoing, nextNodeChainIdForSorting: nextFr, finalOrder: -1 });
            nodeCoordMap[a.to].joinsR.push({ incomingOutgoing: IncomingOutgoing.Incoming, nextNodeChainIdForSorting: nextTo, finalOrder: -1 });
        }
        if (segmentDirection === SegmentDirection.VerticalAroundDown || segmentDirection === SegmentDirection.VerticalAroundUp) {
            nodeCoordMap[a.fr].joinsL.push({ incomingOutgoing: IncomingOutgoing.Outgoing, nextNodeChainIdForSorting: nextFr, finalOrder: -1 });
            nodeCoordMap[a.to].joinsL.push({ incomingOutgoing: IncomingOutgoing.Incoming, nextNodeChainIdForSorting: nextTo, finalOrder: -1 });
        }
        if (segmentDirection === SegmentDirection.ImmediateDown) {
            nodeCoordMap[a.fr].joinsB.unshift({ other: a.to, incomingOutgoing: IncomingOutgoing.Outgoing }); // Use unshift so down is always on left
            nodeCoordMap[a.to].joinsT.unshift({ other: a.fr, incomingOutgoing: IncomingOutgoing.Incoming }); // Use unshift so down is always on left
        }
        if (segmentDirection === SegmentDirection.ImmediateUp) {
            nodeCoordMap[a.fr].joinsT.push({ other: a.to, incomingOutgoing: IncomingOutgoing.Outgoing });
            nodeCoordMap[a.to].joinsB.push({ other: a.fr, incomingOutgoing: IncomingOutgoing.Incoming });
        }
    });

    const bGoesFirst = -1;
    const cGoesFirst = 1;

    nodes.forEach(a => {
        // Sort so that highest join comes first
        nodeCoordMap[a.id].joinsL.sort((b, c) => {
            const bDir = getSegmentDirection(a.id, b.nextNodeChainIdForSorting, nodeCoordMap);
            const cDir = getSegmentDirection(a.id, c.nextNodeChainIdForSorting, nodeCoordMap);
            const bSeq = nodeCoordMap[b.nextNodeChainIdForSorting].sequence;
            const cSeq = nodeCoordMap[c.nextNodeChainIdForSorting].sequence;
            const smallestSequenceGoesFirst = bSeq - cSeq;
            const smallestSequenceGoesLast = cSeq - bSeq;
            // First address special case of same start and end node, i.e. parallel edges, one going each way
            if (b.nextNodeChainIdForSorting === c.nextNodeChainIdForSorting) {
                return b.incomingOutgoing === IncomingOutgoing.Incoming
                    ? bGoesFirst
                    : cGoesFirst;
            }
            if (bDir === SegmentDirection.ImmediateUp || bDir === SegmentDirection.ImmediateDown || cDir === SegmentDirection.ImmediateUp || cDir === SegmentDirection.ImmediateDown) {
                throw new Error("Not possible");
            }
            if (bDir === SegmentDirection.VerticalAroundDown && cDir === SegmentDirection.VerticalAroundDown) {
                return smallestSequenceGoesLast;
            }
            if (bDir === SegmentDirection.VerticalAroundUp && cDir === SegmentDirection.VerticalAroundUp) {
                return smallestSequenceGoesLast;
            }
            if (bDir === SegmentDirection.VerticalAroundUp && cDir === SegmentDirection.VerticalAroundDown) {
                return bGoesFirst;
            }
            if (bDir === SegmentDirection.VerticalAroundDown && cDir === SegmentDirection.VerticalAroundUp) {
                return cGoesFirst;
            }
            if (bDir === SegmentDirection.VerticalAroundDown) {
                return cGoesFirst;
            }
            if (bDir === SegmentDirection.VerticalAroundUp) {
                return bGoesFirst;
            }
            if (cDir === SegmentDirection.VerticalAroundDown) {
                return bGoesFirst;
            }
            if (cDir === SegmentDirection.VerticalAroundUp) {
                return cGoesFirst;
            }
            return smallestSequenceGoesFirst;
        });
        // Sort so that highest join comes first
        nodeCoordMap[a.id].joinsR.sort((b, c) => {
            // First address special case of same start and end node, i.e. parallel edges, one going each way
            if (b.nextNodeChainIdForSorting === c.nextNodeChainIdForSorting) {
                return b.incomingOutgoing === IncomingOutgoing.Incoming
                    ? cGoesFirst
                    : bGoesFirst;
            }
            // Smallest sequence goes first
            return nodeCoordMap[b.nextNodeChainIdForSorting].sequence - nodeCoordMap[c.nextNodeChainIdForSorting].sequence;
        });
        nodeCoordMap[a.id].joinsL.forEach((b, i) => {
            b.finalOrder = i;
        });
        nodeCoordMap[a.id].joinsR.forEach((b, i) => {
            b.finalOrder = i;
        });
    });
}

export function updateNodeCoordMapWithYOffsets(nodes: Node[], nodeCoordMap: NodeCoordMap, s: PositionStyle): void {
    nodes.forEach(a => {
        const nc = nodeCoordMap[a.id];
        nc.joinsL.forEach(b => {
            const offset = getOffsetSeparatedEdges(nc.h, nc.joinsL.length, b.finalOrder, s);
            nc.yOffsetsUsingInOutKey[getKeyInOutNext(b.incomingOutgoing, b.nextNodeChainIdForSorting)] = offset;
        });
        nc.joinsR.forEach(b => {
            const offset = getOffsetSeparatedEdges(nc.h, nc.joinsR.length, b.finalOrder, s);
            nc.yOffsetsUsingInOutKey[getKeyInOutNext(b.incomingOutgoing, b.nextNodeChainIdForSorting)] = offset;
        });
    });
}

function getOffsetSeparatedEdges(h: number, nJoins: number, iJoin: number, s: PositionStyle): number {
    if (h === 0) {
        return 0;
    }
    if (nJoins === 1) {
        return (h / 2);
    }
    const proposedJoinArea = (nJoins - 1) * s.EDGE_TO_EDGE_VERTICAL_GAP;
    const joinableHeight = h - (2 * s.JOIN_MARGIN);
    if (proposedJoinArea > joinableHeight) {
        if (joinableHeight <= 0) {
            return (h / 2);
        }
        const newJoinGap = joinableHeight / (nJoins - 1);
        return (h / 2) - ((nJoins - 1) * newJoinGap / 2) + (iJoin * newJoinGap);
    }
    return (h / 2) - (proposedJoinArea / 2) + (iJoin * s.EDGE_TO_EDGE_VERTICAL_GAP);
}

export function updateNodeCoordMapWithTrackMaps(columns: Columns, nodes: Node[], nodeCoordMap: NodeCoordMap, s: PositionStyle) {

    columns.forEach(colInfo => {
        colInfo.segmentsNormalToTheRight.forEach(seg => {
            nodeCoordMap[seg.left].trackMapXR_forLeftNodes[getKeyInOutNext(
                seg.horizontalDirection === HorizontalDirection.LeftToRight ? IncomingOutgoing.Outgoing : IncomingOutgoing.Incoming,
                seg.right,
            )] = seg.track;
        });
        colInfo.segmentsAroundToTheLeft.forEach(seg => {
            nodeCoordMap[seg.from].trackMapVL_forFromNodes[getKeyInOutNext(IncomingOutgoing.Outgoing, seg.to)] = seg.track; // VerticalAround is always "LeftToRight", direction is always "Same"
        });
    });

    // The rest of this function is for the immediate up and down joins

    const halfSep = s.EDGE_TO_EDGE_HORIZONTAL_GAP / 2;

    nodes.forEach(node => {

        // TOP
        const nTop = nodeCoordMap[node.id].joinsT.length;
        vizAssert(nTop < 3);
        if (nTop === 1) {
            const j1 = nodeCoordMap[node.id].joinsT[0];
            if (j1.incomingOutgoing === IncomingOutgoing.Incoming) {
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j1.other] = 0;
            } else {
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j1.other] = 0;
            }
        }
        if (nTop === 2) {
            const j1 = nodeCoordMap[node.id].joinsT[0];
            const j2 = nodeCoordMap[node.id].joinsT[1];
            if (j1.incomingOutgoing === IncomingOutgoing.Incoming) {
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j1.other] = 0 - halfSep;
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j2.other] = halfSep;
            } else {
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j1.other] = 0 - halfSep;
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j2.other] = halfSep;
            }
        }

        // BOTTOM
        const nBottom = nodeCoordMap[node.id].joinsB.length;
        vizAssert(nBottom < 3);
        if (nBottom === 1) {
            const j1 = nodeCoordMap[node.id].joinsB[0];
            if (j1.incomingOutgoing === IncomingOutgoing.Incoming) {
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j1.other] = 0;
            } else {
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j1.other] = 0;
            }
        }
        if (nBottom === 2) {
            const j1 = nodeCoordMap[node.id].joinsB[0];
            const j2 = nodeCoordMap[node.id].joinsB[1];
            if (j1.incomingOutgoing === IncomingOutgoing.Incoming) {
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j1.other] = 0 - halfSep;
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j2.other] = halfSep;
            } else {
                nodeCoordMap[node.id].immediateOffsetMapOutgoing[j1.other] = 0 - halfSep;
                nodeCoordMap[node.id].immediateOffsetMapIncoming[j2.other] = halfSep;
            }
        }

    });
}
