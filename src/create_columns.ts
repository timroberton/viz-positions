import { ColumnInfo, Columns, TileCoordMap } from "./types";
import { Tile, Node } from "./types_incoming";
import { PositionStyle } from "./types_style";

const _MIN_WIDTH_FOR_TILES = 70;

export function createColumnsAndUpdateTileCoordMap(tiles: Tile[], nodes: Node[], tileCoordMap: TileCoordMap, s: PositionStyle): Columns {

    // Sort tiles into ascending layers
    tiles.sort((a, b) => a.initialFromLayer - b.initialFromLayer);

    const nTiles = tiles.length;

    const maxLayerTiles = nTiles === 0 ? 0 : tiles[nTiles - 1].initialFromLayer;
    const maxLayerNodes = Math.max(...nodes.map(a => a.layer));
    const maxLayer = Math.max(maxLayerNodes, maxLayerTiles);

    const columns: Columns = new Array(maxLayer + 1).fill(0).map<ColumnInfo>(() => {
        return {
            nodeIds: [],
            numberOfNonConnectingNodes: 0,
            keyIsLeftOtherIsRight: {},
            keyIsRightOtherIsLeft: {},
            keyIsSameFromOtherIsSameTo: {},
            //
            segmentsNormalToTheRight: [],
            segmentsAroundToTheLeft: [],
            segmentsImmediate: [],
            //
            numberTracksNormalL: 0,
            numberTracksNormalR: 0,
            hasTracksNormalL: false,
            hasTracksNormalR: false,
            //
            numberTracksAroundL: 0,
            numberTracksAroundR: 0,
            hasTracksAroundL: false,
            hasTracksAroundR: false,
            //
            tileBreakL: false,
            tileBreakR: false,
            //
            maxNodeWidth: _MIN_WIDTH_FOR_TILES,
            //
            xl: 0,
            xc: 0,
            xr: 0,
            yt: 0,
            yb: 0,
            //
            nodeL: 0,
            nodeR: 0,
            //
            edgeVL: 0,
            edgeVR: 0,
        };
    });

    nodes.forEach(node => {
        columns[node.layer].nodeIds.push(node.id);
    });

    if (nTiles === 0) {
        return columns;
    }

    // Add final layerings
    // We assume that tile layers are unique
    // We DON'T assume they start at zero
    for (let i = 0; i < tiles.length; i++) {
        const tc = tileCoordMap[tiles[i].id];
        tc.finalFromLayer = i === 0 ? 0 : tiles[i].initialFromLayer;
        tc.finalToLayer = tiles[i + 1] ? tiles[i + 1].initialFromLayer - 1 : maxLayer;
    }

    // Add joins
    tiles.forEach((tile, i) => {
        const tc = tileCoordMap[tile.id];
        if (s.TILE_HORIZONTAL_GAP > 0) {
            tc.joinL = false;
            tc.joinR = false;
            return;
        }
        if (i === 0 && nTiles === 1) {
            tc.joinL = false;
            tc.joinR = false;
            return;
        }
        if (i === 0) {
            tc.joinL = false;
            tc.joinR = true;
            return;
        }
        if (i === nTiles - 1) {
            tc.joinL = true;
            tc.joinR = false;
            return;
        }
        tc.joinL = true;
        tc.joinR = true;
    });


    return columns;

}