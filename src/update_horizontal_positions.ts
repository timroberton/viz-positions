import { NodeCoordMap, Columns } from "./types";
import { Node } from "./types_incoming";
import { PositionStyle } from "./types_style";

export function updateHorizontalPositions(columns: Columns, nodes: Node[], nodeCoordMap: NodeCoordMap, s: PositionStyle): Columns {

    nodes.forEach(node => {
        const nodeLayer = nodeCoordMap[node.id].layer;
        columns[nodeLayer].maxNodeWidth = Math.max(columns[nodeLayer].maxNodeWidth, node.w);
    });

    let current = 0;
    const maxIndex = columns.length - 1;
    columns.forEach((c, i) => {
        const horizontalTileGapR = (s.SHOW_TILES && c.tileBreakR) ? s.TILE_HORIZONTAL_GAP : 0;
        //
        const extraPaddingForTracksNormalR = (s.SHOW_TILES && c.hasTracksNormalR && c.tileBreakR) ? s.TILE_HORIZONTAL_PADDING : 0;
        const widthTracksNormalR = c.hasTracksNormalR ? ((c.numberTracksNormalR - 1) * s.EDGE_TO_EDGE_HORIZONTAL_GAP) : 0;
        //
        const extraPaddingForTracksAroundL = (s.SHOW_TILES && c.tileBreakL)
            ? (c.hasTracksAroundL ? s.TILE_HORIZONTAL_PADDING : 0)
            : ((c.hasTracksAroundL && c.hasTracksNormalL) ? s.EDGE_TO_EDGE_HORIZONTAL_GAP : 0);
        const widthTracksAroundL = c.hasTracksAroundL ? ((c.numberTracksAroundL - 1) * s.EDGE_TO_EDGE_HORIZONTAL_GAP) : 0;
        //
        const onlyHalfSpaceL = i > 0 && !c.hasTracksNormalL && !c.tileBreakL && !c.hasTracksAroundL;
        const onlyHalfSpaceR = i < maxIndex && !c.hasTracksNormalR && !c.tileBreakR && !c.hasTracksAroundR;
        const paddingL = onlyHalfSpaceL ? s.TILE_HORIZONTAL_PADDING / 2 : s.TILE_HORIZONTAL_PADDING;
        const paddingR = onlyHalfSpaceR ? s.TILE_HORIZONTAL_PADDING / 2 : s.TILE_HORIZONTAL_PADDING;
        //
        c.xl = current;
        c.edgeVL = current + extraPaddingForTracksAroundL;
        c.nodeL = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL;
        c.xc = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + (c.maxNodeWidth / 2);
        c.nodeR = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + c.maxNodeWidth;
        c.edgeVR = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + c.maxNodeWidth + paddingR;
        c.xr = current + extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + c.maxNodeWidth + paddingR + widthTracksNormalR + extraPaddingForTracksNormalR;

        current += extraPaddingForTracksAroundL + widthTracksAroundL + paddingL + c.maxNodeWidth + paddingR + (widthTracksNormalR + extraPaddingForTracksNormalR + horizontalTileGapR);
    });

    let colsYT = Number.POSITIVE_INFINITY;
    let colsYB = Number.NEGATIVE_INFINITY;

    let noNodes = true;

    columns.forEach((colInfo, i) => {
        colInfo.nodeIds.forEach(nodeId => {
            noNodes = false;
            const nodeLayer = nodeCoordMap[nodeId].layer;
            nodeCoordMap[nodeId].x = columns[nodeLayer].xc - (nodeCoordMap[nodeId].w / 2);
            nodeCoordMap[nodeId].colVL = columns[nodeLayer].edgeVL;
            nodeCoordMap[nodeId].colXR = columns[nodeLayer].edgeVR;
            colsYT = Math.min(colsYT, nodeCoordMap[nodeId].y);
            colsYB = Math.max(colsYB, nodeCoordMap[nodeId].y + nodeCoordMap[nodeId].h);
        });
    });

    if (noNodes) {
        colsYT = 0;
        colsYB = 100;
    }

    columns.forEach(c => {
        c.yt = colsYT - (s.SHOW_TILES ? s.TILE_VERTICAL_PADDING : 0);
        c.yb = colsYB + (s.SHOW_TILES ? s.TILE_VERTICAL_PADDING : 0);
    });

    return columns;

}
