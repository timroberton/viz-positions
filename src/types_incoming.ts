import { VERTICAL_SPACING, EDGE_FORMAT } from "./types_style";

export interface Model {
    nodes: Node[],
    edges: Edge[],
    tiles: Tile[],
}

export interface Node {
    id: string,
    initialSequenceWeight: number,
    layer: number,
    w: number,
    h: number,
}

export interface Edge {
    id: string,
    fr: string,
    to: string,
    strokeWidthForArrowCrop: number,
}

export interface Tile {
    id: string,
    initialFromLayer: number,
}

export interface CustomPositionStyle {
    VERTICAL_SPACING?: VERTICAL_SPACING,
    SHOW_TILES?: boolean,
    TILE_HORIZONTAL_GAP?: number,
    NODE_VERTICAL_GAP?: number,
    EDGE_TO_EDGE_VERTICAL_GAP?: number,
    EDGE_TO_EDGE_HORIZONTAL_GAP?: number,
    JOIN_MARGIN?: number,
    COLLAPSE_BUFFER?: number,
    EDGE_FORMAT?: EDGE_FORMAT,
    EDGE_SMOOTHING?: number,
    TILE_VERTICAL_PADDING?: number,
    TILE_HORIZONTAL_PADDING?: number,
}