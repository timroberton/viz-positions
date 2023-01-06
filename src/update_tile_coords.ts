import { Columns, TileCoordMap } from "./types";
import { Tile } from "./types_incoming";

export function updateTileCoords(tiles: Tile[], tileCoordMap: TileCoordMap, columns: Columns): void {
    tiles.forEach(tile => {
        const tc = tileCoordMap[tile.id];
        tc.xl = columns[tc.finalFromLayer].xl;
        tc.xr = columns[tc.finalToLayer].xr;
        tc.yt = columns[tc.finalFromLayer].yt;
        tc.yb = columns[tc.finalFromLayer].yb;
    });
}