import { getSegmentDirection } from "./get_segment_direction";
import { getKeyInOutNext } from "./get_keys";
import { NodeCoordMap, IncomingOutgoing, EdgeCoordMap, Columns, SegmentDirection } from "./types";
import { Edge } from "./types_incoming";
import { PositionStyle } from "./types_style";
import { vizAssert } from "./utils";

export function createBendsMap(edges: Edge[], columns: Columns, nodeCoordMap: NodeCoordMap, edgeCoordMap: EdgeCoordMap, s: PositionStyle): void {

    edges.forEach(edge => {

        const edgeCoords = edgeCoordMap[edge.id];

        for (let i = 1; i < edgeCoords.nodeChain.length; i++) { // NOTE: Start at 1

            const fr = edgeCoords.nodeChain[i - 1];
            const to = edgeCoords.nodeChain[i];

            const segmentDirection = getSegmentDirection(fr, to, nodeCoordMap);

            const isImmediate = segmentDirection === SegmentDirection.ImmediateDown || segmentDirection === SegmentDirection.ImmediateUp;

            const isFirstSegment = i === 1;
            const isLastSegment = i === edgeCoords.nodeChain.length - 1;

            const frNCM = nodeCoordMap[fr];
            const toNCM = nodeCoordMap[to];

            const frCol = columns[frNCM.layer];
            const toCol = columns[toNCM.layer];

            const frOffset = frNCM.isConnecting
                ? 0
                : (isImmediate
                    ? frNCM.immediateOffsetMapOutgoing[to]
                    : frNCM.yOffsetsUsingInOutKey[getKeyInOutNext(IncomingOutgoing.Outgoing, to)]
                );

            const toOffset = toNCM.isConnecting
                ? 0
                : (isImmediate
                    ? toNCM.immediateOffsetMapIncoming[fr]
                    : toNCM.yOffsetsUsingInOutKey[getKeyInOutNext(IncomingOutgoing.Incoming, fr)]
                );

            switch (segmentDirection) {
                case SegmentDirection.LeftToRight:

                    const track1 = frNCM.trackMapXR_forLeftNodes[getKeyInOutNext(IncomingOutgoing.Outgoing, to)];
                    // console.log("T1", track1, frOffset, toOffset)

                    edgeCoords.edgeSegments.push({
                        fr,
                        to,
                        segmentDirection,

                        frX: frNCM.x + frNCM.w,
                        frY: frNCM.y + frOffset,

                        toX: toNCM.x,
                        toY: toNCM.y + toOffset,

                        trackX: frCol.edgeVR + (track1 * s.EDGE_TO_EDGE_VERTICAL_GAP),
                        trackBayStart: frCol.edgeVR,
                        trackBayEnd: (frNCM.x + toNCM.x) / 2,

                        isFirstSegment,
                        isLastSegment,
                    });
                    break;
                case SegmentDirection.RightToLeft:

                    const track2 = toNCM.trackMapXR_forLeftNodes[getKeyInOutNext(IncomingOutgoing.Incoming, fr)];
                    // console.log(track2, frOffset, toOffset)

                    edgeCoords.edgeSegments.push({
                        fr,
                        to,
                        segmentDirection,

                        frX: frNCM.x,
                        frY: frNCM.y + frOffset,

                        toX: toNCM.x + toNCM.w,
                        toY: toNCM.y + toOffset,

                        trackX: toCol.edgeVR + (track2 * s.EDGE_TO_EDGE_VERTICAL_GAP),
                        trackBayStart: toCol.edgeVR,
                        trackBayEnd: (frNCM.x + toNCM.x) / 2,

                        isFirstSegment,
                        isLastSegment,
                    });
                    break;
                case SegmentDirection.VerticalAroundDown:
                    vizAssert(frCol === toCol);

                    const track3 = frNCM.trackMapVL_forFromNodes[getKeyInOutNext(IncomingOutgoing.Outgoing, to)];
                    // console.log("T3", track3, frOffset, toOffset)

                    edgeCoords.edgeSegments.push({
                        fr,
                        to,
                        segmentDirection,

                        frX: frNCM.x,
                        frY: frNCM.y + frOffset,

                        toX: toNCM.x,
                        toY: toNCM.y + toOffset,

                        trackX: frCol.edgeVL + (track3 * s.EDGE_TO_EDGE_VERTICAL_GAP),
                        trackBayStart: frCol.edgeVL,
                        trackBayEnd: (frNCM.x + toNCM.x) / 2,

                        isFirstSegment,
                        isLastSegment,
                    });
                    break;
                case SegmentDirection.VerticalAroundUp:
                    vizAssert(frCol === toCol);

                    const track4 = frNCM.trackMapVL_forFromNodes[getKeyInOutNext(IncomingOutgoing.Outgoing, to)];
                    // console.log("T3", track3, frOffset, toOffset)

                    edgeCoords.edgeSegments.push({
                        fr,
                        to,
                        segmentDirection,

                        frX: frNCM.x,
                        frY: frNCM.y + frOffset,

                        toX: toNCM.x,
                        toY: toNCM.y + toOffset,

                        trackX: frCol.edgeVL + (track4 * s.EDGE_TO_EDGE_VERTICAL_GAP),
                        trackBayStart: frCol.edgeVL,
                        trackBayEnd: (frNCM.x + toNCM.x) / 2,

                        isFirstSegment,
                        isLastSegment,
                    });
                    break;
                case SegmentDirection.ImmediateDown:
                    edgeCoords.edgeSegments.push({
                        fr,
                        to,
                        segmentDirection,

                        frX: frNCM.x + (frNCM.w / 2) + frOffset,
                        frY: frNCM.y + frNCM.h,

                        toX: toNCM.x + (toNCM.w / 2) + toOffset,
                        toY: toNCM.y,

                        trackX: -1,
                        trackBayStart: -1,
                        trackBayEnd: -1,

                        isFirstSegment,
                        isLastSegment,
                    });
                    break;
                case SegmentDirection.ImmediateUp:
                    edgeCoords.edgeSegments.push({
                        fr,
                        to,
                        segmentDirection,

                        frX: frNCM.x + (frNCM.w / 2) + frOffset,
                        frY: frNCM.y,

                        toX: toNCM.x + (toNCM.w / 2) + toOffset,
                        toY: toNCM.y + toNCM.h,

                        trackX: -1,
                        trackBayStart: -1,
                        trackBayEnd: -1,

                        isFirstSegment,
                        isLastSegment,
                    });
                    break;
            }

        }

    });

}
