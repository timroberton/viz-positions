import { Columns, ModelBounds } from "./types";

export function getModelBounds(columns: Columns): ModelBounds {

    const bounds: ModelBounds = {
        xMin: Number.POSITIVE_INFINITY,
        xMax: Number.NEGATIVE_INFINITY,
        yMin: Number.POSITIVE_INFINITY,
        yMax: Number.NEGATIVE_INFINITY,
    };

    columns.forEach(a => {
        bounds.xMin = Math.min(a.xl, bounds.xMin);
        bounds.xMax = Math.max(a.xr, bounds.xMax);
        bounds.yMin = Math.min(a.yt, bounds.yMin);
        bounds.yMax = Math.max(a.yb, bounds.yMax);
    });

    return bounds;

}