import { Edge } from "./types_incoming";
import { EdgeCoordMap, EdgeSegment, SegmentDirection } from "./types";
import { EDGE_FORMAT, PositionStyle } from "./types_style";

export function addPathData(edges: Edge[], edgeCoordMap: EdgeCoordMap, s: PositionStyle): void {
    edges.forEach(edge => {
        const ew = edge.strokeWidthForArrowCrop;
        const sm = s.EDGE_SMOOTHING;
        const ec = edgeCoordMap[edge.id];
        switch (s.EDGE_FORMAT) {
            case EDGE_FORMAT.classic:
                ec.pathData = getPathDataStraight(ec.edgeSegments, ew, sm);
                return;
            case EDGE_FORMAT.straight:
                ec.pathData = getPathDataStraight(ec.edgeSegments, ew, sm);
                return;
        }
    });
}

function getPathDataStraight(edgeSegments: EdgeSegment[], ew: number, smoothing: number): string {

    let startX = edgeSegments[0].frX;
    let startY = edgeSegments[0].frY;

    let d = `M ${startX} ${startY}`;

    const nFillers = 16 - edgeSegments.length;

    for (let i = 0; i < nFillers; i++) {
        d += ` C ${startX},${startY} ${startX},${startY} ${startX},${startY} L ${startX},${startY} C ${startX},${startY} ${startX},${startY} ${startX},${startY}`;
    }

    const _MAX_DELTA_LENGTH = smoothing;
    const _MIN_ANGLE_DISPLACEMENT_THRESHOLD = 8;

    return edgeSegments.reduce((acu, sg) => {

        if (sg.isLastSegment) {
            cropLastBendForArrow(sg, ew);
        }

        const deltaLength = Math.min(Math.abs(sg.toY - sg.frY) / 2, _MAX_DELTA_LENGTH);
        const d = deltaLength * Math.sign(sg.toY - sg.frY); // positive is for "going down";

        // Angle displacement (left and right)
        let ADL = 0;
        let ADR = 0;
        const useAngleDisplacement = (deltaLength < _MIN_ANGLE_DISPLACEMENT_THRESHOLD);
        if (useAngleDisplacement) {
            const xdL = sg.trackX - sg.frX;
            const xdR = sg.toX - sg.trackX;
            const halfMinXD = Math.min(Math.abs(xdL), Math.abs(xdR)) / 2;
            const AD = halfMinXD * (1 - (deltaLength / _MIN_ANGLE_DISPLACEMENT_THRESHOLD));
            ADL = AD * Math.sign(xdL);
            ADR = AD * Math.sign(xdR);
        }

        if (
            sg.segmentDirection === SegmentDirection.LeftToRight ||
            sg.segmentDirection === SegmentDirection.RightToLeft ||
            sg.segmentDirection === SegmentDirection.VerticalAroundDown ||
            sg.segmentDirection === SegmentDirection.VerticalAroundUp
        ) {
            return acu + ` C ${sg.trackX - ADL},${sg.frY} ${sg.trackX - ADL},${sg.frY} ${sg.trackX},${sg.frY + d} L ${sg.trackX},${sg.toY - d} C ${sg.trackX + ADR},${sg.toY} ${sg.trackX + ADR},${sg.toY} ${sg.toX},${sg.toY}`;
        }

        if (
            sg.segmentDirection === SegmentDirection.ImmediateDown ||
            sg.segmentDirection === SegmentDirection.ImmediateUp
        ) {
            return acu + ` C ${sg.frX},${sg.frY} ${sg.frX},${sg.frY} ${sg.frX},${sg.frY} L ${sg.toX},${sg.toY} C ${sg.toX},${sg.toY} ${sg.toX},${sg.frY} ${sg.toX},${sg.toY}`;
        }

        throw new Error("Should not reach here");

    }, d);

}

function cropLastBendForArrow(seg: EdgeSegment, ew: number) {
    const _CROP_LENGTH = ew;
    switch (seg.segmentDirection) {
        case SegmentDirection.LeftToRight:
            seg.toX -= _CROP_LENGTH;
            break;
        case SegmentDirection.RightToLeft:
            seg.toX += _CROP_LENGTH;
            break;
        case SegmentDirection.VerticalAroundDown:
            seg.toX -= _CROP_LENGTH;
            break;
        case SegmentDirection.VerticalAroundUp:
            seg.toX -= _CROP_LENGTH;
            break;
        case SegmentDirection.ImmediateDown:
            seg.toY -= _CROP_LENGTH;
            break;
        case SegmentDirection.ImmediateUp:
            seg.toY += _CROP_LENGTH;
            break;
    }
}