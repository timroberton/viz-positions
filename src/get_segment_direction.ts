import { NodeCoordMap, SegmentDirection } from "./types";

export function getSegmentDirection(frId: string, toId: string, nodeCoordMap: NodeCoordMap): SegmentDirection {

    const frNC = nodeCoordMap[frId];
    const toNC = nodeCoordMap[toId];

    if (!frNC || !toNC) {
        throw new Error("Should not be possible");
    }

    if (frNC.layer < toNC.layer) {
        return SegmentDirection.LeftToRight;
    }

    if (frNC.layer > toNC.layer) {
        return SegmentDirection.RightToLeft;
    }

    if (frNC.isConnecting || toNC.isConnecting) {
        throw new Error("Should not be possible");
    }

    if (toNC.sequenceIgnoringConnectingNodes === frNC.sequenceIgnoringConnectingNodes + 1) {
        return SegmentDirection.ImmediateDown;
    }

    if (toNC.sequenceIgnoringConnectingNodes === frNC.sequenceIgnoringConnectingNodes - 1) {
        return SegmentDirection.ImmediateUp;
    }

    if (frNC.sequenceIgnoringConnectingNodes < toNC.sequenceIgnoringConnectingNodes) {
        return SegmentDirection.VerticalAroundDown;
    }

    return SegmentDirection.VerticalAroundUp;

}