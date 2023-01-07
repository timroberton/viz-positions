import { NodeCoordMap, Columns, EdgeCoordMap, TileCoordMap } from "./types";
import { Edge, Tile } from "./types_incoming";
import { PositionStyle } from "./types_style";
export declare function updateColumnsWithEdgeConnections(columns: Columns, edges: Edge[], nodeCoordMap: NodeCoordMap, edgeCoordMap: EdgeCoordMap): Columns;
export declare function updateColumnsWithYOffsets(columns: Columns, nodeCoordMap: NodeCoordMap): void;
export declare function updateColumnsWithSegmentsNormalAndAround(columns: Columns, nodeCoordMap: NodeCoordMap): void;
export declare function sortAndCollapseSegmentTracks(columns: Columns, s: PositionStyle): void;
export declare function updateColumnsWithBreakInfo(columns: Columns, tiles: Tile[], tileCoordMap: TileCoordMap): void;
//# sourceMappingURL=update_columns.d.ts.map