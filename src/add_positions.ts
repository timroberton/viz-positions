import { Model } from "./types_incoming";
import {
  NodeCoordMap,
  EdgeCoordMap,
  Columns,
  ModelBounds,
  TileCoordMap,
} from "./types";
import { createBendsMap } from "./create_bends_map";
import { createColumnsAndUpdateTileCoordMap } from "./create_columns";
import {
  createNodeCoordMap,
  addAndSortNodeJoins,
  updateNodeCoordMapWithYOffsets,
  createEdgeCoordMap,
  updateNodeCoordMapWithTrackMaps,
  createTileCoordMap,
} from "./create_node_coord_map";
import { addConnectingNodes } from "./add_connecting_nodes";
import {
  updateColumnsWithEdgeConnections,
  sortAndCollapseSegmentTracks,
  updateColumnsWithBreakInfo,
  updateColumnsWithSegmentsNormalAndAround,
  updateColumnsWithYOffsets,
} from "./update_columns";
import { sortSequencing } from "./sort_sequencing";
import { updateVerticalPositions } from "./update_vertical_positions";
import { updateHorizontalPositions } from "./update_horizontal_positions";
import { _DEFAULT_POSITIONSTYLE } from "./default_style";
import { addPathData } from "./add_path_data";
import { getModelBounds } from "./get_model_bounds";
import { CustomPositionStyle } from "./types_incoming";
import { updateTileCoords } from "./update_tile_coords";
import { PositionStyle } from "./types_style";

export function addPositionsSimple(
  m: Model,
  customStyleProps?: CustomPositionStyle
): {
  nodeCoordMap: NodeCoordMap;
  edgeCoordMap: EdgeCoordMap;
  tileCoordMap: TileCoordMap;
  columns: Columns;
  bounds: ModelBounds;
} {
  const s: PositionStyle = {
    ..._DEFAULT_POSITIONSTYLE,
    ...customStyleProps,
  };

  const nodeCoordMap = createNodeCoordMap(m.nodes);
  const edgeCoordMap = createEdgeCoordMap(m.edges);
  const tileCoordMap = createTileCoordMap(m.tiles);

  const columns = createColumnsAndUpdateTileCoordMap(
    m.tiles,
    m.nodes,
    tileCoordMap,
    s
  );

  addConnectingNodes(m.nodes, m.edges, nodeCoordMap, edgeCoordMap, columns);

  updateColumnsWithEdgeConnections(
    columns,
    m.edges,
    nodeCoordMap,
    edgeCoordMap
  );

  // Sequencing
  sortSequencing(m.nodes, columns, nodeCoordMap, s);

  // This adds and sorts the joins
  addAndSortNodeJoins(m.nodes, m.edges, nodeCoordMap, edgeCoordMap);

  // This adds yOffsets, based on join order
  updateNodeCoordMapWithYOffsets(m.nodes, nodeCoordMap, s);

  // Update columns with RECURSIVE yOffsets
  updateColumnsWithYOffsets(columns, nodeCoordMap);

  // Vertical spacing
  updateVerticalPositions(columns, nodeCoordMap, s);

  // Update columns SEGMENTS and BREAKS
  updateColumnsWithSegmentsNormalAndAround(columns, nodeCoordMap);
  sortAndCollapseSegmentTracks(columns, s);

  updateColumnsWithBreakInfo(columns, m.tiles, tileCoordMap);
  updateNodeCoordMapWithTrackMaps(columns, m.nodes, nodeCoordMap, s);

  // Horizontal spacing
  updateHorizontalPositions(columns, m.nodes, nodeCoordMap, s);

  updateTileCoords(m.tiles, tileCoordMap, columns);

  // Edges
  createBendsMap(m.edges, columns, nodeCoordMap, edgeCoordMap, s);
  addPathData(m.edges, edgeCoordMap, s);

  // Bounds
  const bounds = getModelBounds(columns);

  return { nodeCoordMap, edgeCoordMap, tileCoordMap, columns, bounds };
}
