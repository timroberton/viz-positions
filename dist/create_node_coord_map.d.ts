import { Edge, Node, Tile } from "./types_incoming";
import { Columns, EdgeCoordMap, NodeCoordMap, NodeCoords, TileCoordMap } from "./types";
import { PositionStyle } from "./types_style";
export declare function createNodeCoordMap(nodes: Node[]): NodeCoordMap;
export declare function newNodeCoords(w: number, h: number, isConnecting: boolean, layer: number, endFrIfConnecting: string, endToIfConnecting: string): NodeCoords;
export declare function createEdgeCoordMap(edges: Edge[]): EdgeCoordMap;
export declare function createTileCoordMap(tiles: Tile[]): TileCoordMap;
export declare function addAndSortNodeJoins(nodes: Node[], edges: Edge[], nodeCoordMap: NodeCoordMap, edgeCoordMap: EdgeCoordMap): void;
export declare function updateNodeCoordMapWithYOffsets(nodes: Node[], nodeCoordMap: NodeCoordMap, s: PositionStyle): void;
export declare function updateNodeCoordMapWithTrackMaps(columns: Columns, nodes: Node[], nodeCoordMap: NodeCoordMap, s: PositionStyle): void;
//# sourceMappingURL=create_node_coord_map.d.ts.map