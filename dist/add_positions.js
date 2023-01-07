"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.addPositionsSimple = void 0;
var create_bends_map_1 = require("./create_bends_map");
var create_columns_1 = require("./create_columns");
var create_node_coord_map_1 = require("./create_node_coord_map");
var add_connecting_nodes_1 = require("./add_connecting_nodes");
var update_columns_1 = require("./update_columns");
var sort_sequencing_1 = require("./sort_sequencing");
var update_vertical_positions_1 = require("./update_vertical_positions");
var update_horizontal_positions_1 = require("./update_horizontal_positions");
var default_style_1 = require("./default_style");
var add_path_data_1 = require("./add_path_data");
var get_model_bounds_1 = require("./get_model_bounds");
var update_tile_coords_1 = require("./update_tile_coords");
function addPositionsSimple(m, customStyleProps) {
    var s = __assign(__assign({}, default_style_1._DEFAULT_POSITIONSTYLE), customStyleProps);
    var nodeCoordMap = create_node_coord_map_1.createNodeCoordMap(m.nodes);
    var edgeCoordMap = create_node_coord_map_1.createEdgeCoordMap(m.edges);
    var tileCoordMap = create_node_coord_map_1.createTileCoordMap(m.tiles);
    var columns = create_columns_1.createColumnsAndUpdateTileCoordMap(m.tiles, m.nodes, tileCoordMap, s);
    add_connecting_nodes_1.addConnectingNodes(m.nodes, m.edges, nodeCoordMap, edgeCoordMap, columns);
    update_columns_1.updateColumnsWithEdgeConnections(columns, m.edges, nodeCoordMap, edgeCoordMap);
    // Sequencing
    sort_sequencing_1.sortSequencing(m.nodes, columns, nodeCoordMap, s);
    // This adds and sorts the joins
    create_node_coord_map_1.addAndSortNodeJoins(m.nodes, m.edges, nodeCoordMap, edgeCoordMap);
    // This adds yOffsets, based on join order
    create_node_coord_map_1.updateNodeCoordMapWithYOffsets(m.nodes, nodeCoordMap, s);
    // Update columns with RECURSIVE yOffsets
    update_columns_1.updateColumnsWithYOffsets(columns, nodeCoordMap);
    // Vertical spacing
    update_vertical_positions_1.updateVerticalPositions(columns, nodeCoordMap, s);
    // Update columns SEGMENTS and BREAKS
    update_columns_1.updateColumnsWithSegmentsNormalAndAround(columns, nodeCoordMap);
    update_columns_1.sortAndCollapseSegmentTracks(columns, s);
    update_columns_1.updateColumnsWithBreakInfo(columns, m.tiles, tileCoordMap);
    create_node_coord_map_1.updateNodeCoordMapWithTrackMaps(columns, m.nodes, nodeCoordMap, s);
    // Horizontal spacing
    update_horizontal_positions_1.updateHorizontalPositions(columns, m.nodes, nodeCoordMap, s);
    update_tile_coords_1.updateTileCoords(m.tiles, tileCoordMap, columns);
    // Edges
    create_bends_map_1.createBendsMap(m.edges, columns, nodeCoordMap, edgeCoordMap, s);
    add_path_data_1.addPathData(m.edges, edgeCoordMap, s);
    // Bounds
    var bounds = get_model_bounds_1.getModelBounds(columns);
    return { nodeCoordMap: nodeCoordMap, edgeCoordMap: edgeCoordMap, tileCoordMap: tileCoordMap, columns: columns, bounds: bounds };
}
exports.addPositionsSimple = addPositionsSimple;
