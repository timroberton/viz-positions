import { Model } from "./types_incoming";
import { NodeCoordMap, EdgeCoordMap, Columns, ModelBounds, TileCoordMap } from "./types";
import { CustomPositionStyle } from "./types_incoming";
export declare function addPositionsSimple(m: Model, customStyleProps?: CustomPositionStyle): {
    nodeCoordMap: NodeCoordMap;
    edgeCoordMap: EdgeCoordMap;
    tileCoordMap: TileCoordMap;
    columns: Columns;
    bounds: ModelBounds;
};
//# sourceMappingURL=add_positions.d.ts.map