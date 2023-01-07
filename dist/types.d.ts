export declare type Columns = ColumnInfo[];
export declare type ColumnInfo = {
    nodeIds: string[];
    numberOfNonConnectingNodes: number;
    keyIsLeftOtherIsRight: FromToMapper;
    keyIsRightOtherIsLeft: FromToMapper;
    keyIsSameFromOtherIsSameTo: FromToMapper;
    segmentsNormalToTheRight: SegmentNormal[];
    segmentsAroundToTheLeft: SegmentAround[];
    segmentsImmediate: SegmentImmediate[];
    hasTracksNormalL: boolean;
    hasTracksNormalR: boolean;
    numberTracksNormalL: number;
    numberTracksNormalR: number;
    hasTracksAroundL: boolean;
    hasTracksAroundR: boolean;
    numberTracksAroundL: number;
    numberTracksAroundR: number;
    tileBreakL: boolean;
    tileBreakR: boolean;
    maxNodeWidth: number;
    xl: number;
    xc: number;
    xr: number;
    yt: number;
    yb: number;
    nodeL: number;
    nodeR: number;
    edgeVL: number;
    edgeVR: number;
};
export declare type Segment = SegmentNormal | SegmentAround | SegmentImmediate;
export declare type SegmentNormal = {
    left: string;
    right: string;
    frEnd: string;
    toEnd: string;
    horizontalDirection: HorizontalDirection;
    yLeft: number;
    yRight: number;
    yTop: number;
    yBottom: number;
    totalHeight: number;
    leftToRightGoesUp: boolean;
    leftToRightGoesDown: boolean;
    leftToRightGoesStraight: boolean;
    track: number;
};
export declare type SegmentAround = {
    from: string;
    to: string;
    yFrom: number;
    yTo: number;
    yTop: number;
    yBottom: number;
    totalHeight: number;
    fromToGoesUp: boolean;
    fromToGoesDown: boolean;
    track: number;
};
export declare type SegmentImmediate = {
    fr: string;
    to: string;
    goesUp: boolean;
    goesDown: boolean;
};
export declare type FromToMapper = {
    [key: string]: FromToConnection[];
};
export declare type FromToConnection = {
    self: string;
    other: string;
    frEnd: string;
    toEnd: string;
    offsetSelf: number;
    offsetOther: number;
    horizontalDirection: HorizontalDirection;
};
export declare type NodeCoordMap = {
    [key: string]: NodeCoords;
};
export declare type NodeCoords = {
    w: number;
    h: number;
    isConnecting: boolean;
    endFrIfConnecting: string;
    endToIfConnecting: string;
    layer: number;
    sequence: number;
    sequenceIgnoringConnectingNodes: number;
    y: number;
    x: number;
    colXL: number;
    colXR: number;
    colVL: number;
    trackMapXR_forLeftNodes: {
        [key: string]: number;
    };
    trackMapVL_forFromNodes: {
        [key: string]: number;
    };
    immediateOffsetMapIncoming: {
        [key: string]: number;
    };
    immediateOffsetMapOutgoing: {
        [key: string]: number;
    };
    joinsL: Join[];
    joinsR: Join[];
    joinsT: {
        other: string;
        incomingOutgoing: IncomingOutgoing;
    }[];
    joinsB: {
        other: string;
        incomingOutgoing: IncomingOutgoing;
    }[];
    yOffsetsUsingInOutKey: {
        [key: string]: number;
    };
};
export declare type Join = {
    nextNodeChainIdForSorting: string;
    incomingOutgoing: IncomingOutgoing;
    finalOrder: number;
};
export declare type EdgeCoordMap = {
    [key: string]: EdgeCoords;
};
export declare type EdgeCoords = {
    id: string;
    fr: string;
    to: string;
    nodeChain: string[];
    edgeSegments: EdgeSegment[];
    pathData: string;
};
export declare type EdgeSegment = {
    fr: string;
    to: string;
    segmentDirection: SegmentDirection;
    frX: number;
    frY: number;
    toX: number;
    toY: number;
    trackX: number;
    trackBayStart: number;
    trackBayEnd: number;
    isFirstSegment: boolean;
    isLastSegment: boolean;
};
export declare type TileCoordMap = {
    [key: string]: TileCoords;
};
export declare type TileCoords = {
    finalFromLayer: number;
    finalToLayer: number;
    joinL: boolean;
    joinR: boolean;
    xl: number;
    xr: number;
    yt: number;
    yb: number;
};
export declare enum IncomingOutgoing {
    Incoming = "Incoming",
    Outgoing = "Outgoing"
}
export declare enum HorizontalDirection {
    LeftToRight = "LeftToRight",
    RightToLeft = "RightToLeft",
    Same = "Same"
}
export declare enum SegmentDirection {
    LeftToRight = "LeftToRight",
    RightToLeft = "RightToLeft",
    VerticalAroundUp = "VerticalAroundUp",
    VerticalAroundDown = "VerticalAroundDown",
    ImmediateUp = "ImmediateUp",
    ImmediateDown = "ImmediateDown"
}
export declare type ModelBounds = {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
};
//# sourceMappingURL=types.d.ts.map